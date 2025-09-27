---
title: Simple Python profiling
description: Fast and easy way to identify hotspots in your python code
slug: simple-python-profiling
favicon: ⏱️
published: 2025-09-27
---

For a [small side-project](https://github.com/boyswithoutsockson/eduri) I'm
working on with a couple of friends, we need to parse large amounts of data from
the [Finnish Parliament open data repository](https://avoindata.eduskunta.fi/).
While it's great to be able to access all the data, such as votes, proposals,
meeting minutes et cetera, the format of the data often leaves quite a lot to be
desired. In particular, one of the available datasets (named Vaski) is a table
with one significant column; raw
[XML](https://developer.mozilla.org/en-US/docs/Web/XML/Guides/XML_introduction)
strings of different types of documents (over 70 document types). In total, the
data set weighs nearly 7 gigabytes, but at this point, we are only interested in
some of the document types.

While developing pipelines for extracting interesting data, parsing through the
whole dataset exported as a `.tsv` file is quite cumbersome, especially when
trying to troubleshoot any errors in the extraction processes. We therefore
wanted to split the huge file into subfiles containing only a single document
type each. The initial script for this splitting worked well, but with little
consideration for performance, it took around 3 minutes to run. That's not a
long time for a preprocessing task that isn't supposed to be run frequently, but
as I wanted to add pull request automation that would run it way more often, the
runtime started to annoy me.

In order to start optimizing a code snippet such as this, it's quite important
to be able to identify where the actual bottlenecks are. Python includes a
built-in profiler with
[`cProfile`](https://docs.python.org/3/library/profile.html), but its output is
quite low level and verbose. As an alternative and a more high-level approach,
[`line_profiler`](https://github.com/pyutils/line_profiler) seemed to suit my
needs much better. After installing it, adding a `@profile` decorator to the
function I was interested in and running the script with
`kernprof -l -v script_name.py` I got the following output:

```python
Timer unit: 1e-06 s

Total time: 185.304 s
File: pipes/vaski_parser.py
Function: vaski_parser at line 9

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
     9                                           @profile
    10                                           def vaski_parser():
    11         1         81.1     81.1      0.0      pd.options.mode.copy_on_write = True
    12
    13         1         15.5     15.5      0.0      vaski_fname = os.path.join("data", "raw", "VaskiData.tsv")
    14
    15        32   73644115.8  2.3e+06     39.7      for vaski_data in tqdm(pd.read_csv(vaski_fname, sep="\t", chunksize=10000), total=31):
    16        62   59057615.8 952542.2     31.9          vaski_data['Xml'] = vaski_data["XmlData"].apply(
    17        31         37.9      1.2      0.0              lambda x: etree.fromstring(x)
    18                                                   )
    19        62      57218.3    922.9      0.0          vaski_data = vaski_data[  # Only keep finnish files
    20        62     471448.0   7604.0      0.3              vaski_data['Xml'].apply(
    21        31         28.8      0.9      0.0                  lambda x: x[0][0].text.endswith('_fi')
    22                                                       )
    23                                                   ]
    24        62     341058.9   5500.9      0.2          vaski_data['doctype'] = vaski_data['Xml'].apply(
    25        31         28.2      0.9      0.0              lambda x: x[0][0].text[13:]  # All doctypes start with VASKI_JULKVP_
    26                                                   )
    27
    28      1423      17664.2     12.4      0.0          for doctype in vaski_data['doctype'].unique():
    29      2784    3080048.6   1106.3      1.7              sub_vaski = vaski_data[vaski_data['doctype'] == doctype].drop(
    30      1392       1062.6      0.8      0.0                  columns=["doctype", 'Xml']
    31                                                       )
    32      1392      20919.4     15.0      0.0              f_path = os.path.join("data", "raw", "vaski", f"{doctype}.tsv")
    33      1392      21747.1     15.6      0.0              if not os.path.exists(f_path):  # If no file, write header
    34                                                           sub_vaski.to_csv(f_path, sep="\t", header=True, index=False)
    35                                                       else:  # If file, no header and append
    36      1392   48591207.5  34907.5     26.2                  sub_vaski.to_csv(f_path, sep="\t", header=False, index=False, mode='a')
```

The simplest way to parse this is to just look at the `% Time` column, and to
see which lines take the most amount of time proportionally during the script's
execution. Our culprits – lines `15`, `16` and `36` – use up to **98%** of the
execution time of the whole script.

The most obvious place for improvement is in line `16`, where we map a
[`pandas.DataFrame`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)
column converting its string contents to an
[XML tree](https://lxml.de/tutorial.html) structure. Now that we know what data
we actually want from the XML, the language and the `doctype` that luckily
appear at the same part in each document, we can avoid parsing the whole thing
and instead just match a
[regex](https://en.wikipedia.org/wiki/Regular_expression) at the right spot.
This also has the added benefit of making the code much more succinct.

After the change, we run the profiler again (this time I've omitted other
columns from the output besides `Line #`, `% Time` and `Line Contents` for
brevity):

```python
Timer unit: 1e-06 s

Total time: 110.598 s
File: pipes/vaski_parser.py
Function: vaski_parser at line 9

Line #  % Time  Line Contents
=============================
     9          @profile
    10          def vaski_parser():
    11     0.0      pd.options.mode.copy_on_write = True
    12     0.0      vaski_fname = os.path.join("data", "raw", "VaskiData.tsv")
    14    51.3      for vaski_data in tqdm(pd.read_csv(vaski_fname, sep="\t", chunksize=10000), total=31):
    16     0.9          vaski_data['doctype'] = vaski_data["XmlData"].str.extract(r"(VASKI_JULKVP_\w+)")
    17     0.3          vaski_data = vaski_data[vaski_data['doctype'].str.endswith('_fi')]
    18     0.0          for doctype in vaski_data['doctype'].unique():
    20     2.8              sub_vaski = vaski_data[vaski_data['doctype'] == doctype].drop(columns=["doctype"])
    21     0.0              f_path = os.path.join("data", "raw", "vaski", f"{doctype}.tsv")
    22     0.0              if not os.path.exists(f_path):
    23     2.7                  sub_vaski.to_csv(f_path, sep="\t", header=True, index=False)
    24                      else:
    25    41.9                  sub_vaski.to_csv(f_path, sep="\t", header=False, index=False, mode='a')
```

Awesome, we can now run the whole thing in 110 seconds instead of 180!

Now we see that almost all of the runtime is taken up by
[`pandas.read_csv()`](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html)
and
[`DataFrame.to_csv()`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html).
There isn't much that can be done to tweak these functions, as I tried a couple
of different values for the `chunksize` argument to `read_csv` without any
significant differences. I do however know that 7 gigabytes isn't actually that
much data, especially considering that the
[SSD in my desktop PC](https://www.harddrivebenchmark.net/hdd.php?id=15984)
should be capable of theoretical maximum throughputs of over 2 GB/s for both
read and write.

With not much to do using Pandas, I wanted to try playing with the new kid on
the block, [Polars](https://pola.rs/), who
[claims to be able to achieve up to 50x performance improvements over pandas](https://pola.rs/#:~:text=Built%20by%20developers%20for%20developers%20to%20achieve%20up%20to%2050x%20performance).
I had heard much praise for it, so I wanted to test these claims out. The API
for `DataFrame`s is quite similar for both of them, so porting the code over was
quite simple.

```python
Wrote profile results to 'vaski_parser.py.lprof'
Timer unit: 1e-06 s

Total time: 6.87593 s
File: pipes/vaski_parser.py
Function: vaski_parser at line 10

Line #  % Time  Line Contents
=============================
    10          @profile
    11          def vaski_parser():
    12     0.0      vaski_fname = os.path.join("data", "raw", "VaskiData.tsv")
    13
    14    29.6      for vaski_data in tqdm(pl.read_csv(vaski_fname, separator="\t", has_header=True).iter_slices(n_rows=10_000), total=31):
    15     1.5          vaski_data = vaski_data.with_columns(
    16     0.0              pl.col("XmlData").str.extract(r"VASKI_JULKVP_(\w+)").alias("doctype")
    17                  )
    18     0.3          vaski_data = vaski_data.filter(pl.col("doctype").str.ends_with("_fi"))
    19
    20     4.3          for (doctype,), sub_vaski in vaski_data.group_by("doctype"):
    21     0.4              f_path = os.path.join("data", "raw", "vaski", f"{doctype}.tsv")
    22     5.5              sub_vaski = sub_vaski.drop("doctype")
    23     1.1              with open(f_path, mode="a" if os.path.exists(f_path) else "w") as f:
    24    57.1                  sub_vaski.write_csv(f, separator="\t", include_header=not os.path.exists(f_path))

```

Hot damn, it really is fast! Not a 50x increase, but dropping from 110 seconds
to just **7 seconds** (so almost 16x) is a remarkable improvement for such a
small effort. This also takes the execution time really close to the theoretical
maximum [I/O](https://en.wikipedia.org/wiki/Input/output) of my hardware, so at
this point I don't see a reason to try to optimize further.

Overall, [`line_profiler`](https://github.com/pyutils/line_profiler) worked
great for me in quickly identifying the bottlenecks of the code, and the
surprise(?) winner is surely `polars` for parsing and writing `.{c,t}sv` files
so much faster than the incumbent `pandas`.
