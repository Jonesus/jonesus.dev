---
title: Optimizing fonts
description: How to use custom fonts on your own site with good conscience
slug: optimizing-fonts
favicon: 🗜️
published: 2025-09-14
---

For a minimal site such as this one, the choice of a typeface has a huge impact
on the feel. It's nice to be able to use something that you like and that makes
your site feel unique. I guess that the most common approach today is to use
[Google Fonts](https://fonts.google.com/) to link a specific font to your site,
but that creates a huge external dependency on a third party. It used to be that
by using Google Fonts, a specific font downloaded from site `A` could also be
reused from your browser's cache by site `B`, but
[that hasn't been the case for a while.](https://wicki.io/posts/2020-11-goodbye-google-fonts/)
I therefore wanted to host the fonts of my site myself.

As someone who wants to try and make the web a more
[accessible](https://www.w3.org/WAI/fundamentals/accessibility-intro/) place, I
stumbled upon the font
[Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) that aims to
be one of the most readable fonts available. It also looks quite nice, I think!
Perhaps not the most distinct one out there, but with vision that can be easily
corrected with just normal eyeglasses, I'll trust that the Braille Institute has
done their research on the font's benefits.

The font is available in three variants: Atkinson Hyperlegible (hereafter known
as Normal), Atkinson Hyperlegible Next (Next), and Atkinson Hyperlegible Mono
(Mono). The Normal has static files for different weights and italics, Next
includes one
[variable weight font file](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide)
for both upright and italic styles, and Mono similarly includes one upright and
one italic variable weight file.

## The baseline

Variable fonts are a nice way to allow a site to have many different variants
(duh) of the same font, and they are quite often much slimmer files than having
multiple static fonts for each weight would be. For example, after downloading
the [Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next) font
files from Google Fonts, the single variable file for the upright Next font
(`AtkinsonHyperlegibleNext-VariableFont_wght.ttf`) would be `112kb`, while the
corresponding static files (`static/AtkinsonHyperlegibleNext-{WEIGHT}.ttf`)
would total `340kb`, almost exactly three times as much!

So, as long as a site uses more than one weight (like this one does), using a
variable font is a simple way to shave off some unnecessary bytes from whoever
might read content such as this. However, in addition to different weights of
the upright font, I know that I need to have italic text (an additional `124kb`
for the italic variable weight font). Also, for my
[projects listing page](/projects), I'd love to have the years neatly aligned
which would be a nice use case for
[`font-variant-numeric: tabular-nums`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric),
but as the Next font doesn't include any glyph variations for numbers to have
uniform width, I would need to use the Mono font as a substitute (`54kb` for the
variable weight one). So in order to use the fonts that I want, I would need
each user to download (upright `112kb` + italic `124kb` + mono `56kb` =) `292kb`
of just fonts! That's a no-go, especially considering that the weight of a full
cacheless load of this page without fonts would be ~`30kb`.

So, let's get into optimizing!

## Step 1: better file format

The default file format when downloading stuff off of Google Fonts is
[TrueType (`.ttf`)](https://en.wikipedia.org/wiki/TrueType), which is a good
choice for compatibility but a bad choice for file sizes. A more modern
alternative would be the [WOFF2](https://www.w3.org/TR/WOFF2/) format, which at
[over 95% global device support](https://caniuse.com/woff2) is an
incompatibility risk I am more than willing to take.

To convert a `.ttf` file to `.woff2`, you can use the command-line tool
[`woff2_compress`](https://github.com/google/woff2) (also available on
Debian-based systems with `sudo apt install woff2`):

```sh
woff2_compress {FONT_FILE_NAME}.ttf
```

After running it for each of our fonts, we have the following:

| Variant   | Size (`.ttf`) | Size (`.woff2`) |
| --------- | ------------- | --------------- |
| Upright   | `112kb`       | `48kb`          |
| Italic    | `124kb`       | `52kb`          |
| Mono      | `56kb`        | `28kb`          |
| **Total** | `292kb`       | `128kb`         |

That's an easy win of over 50% of the original file size!

## Step 2: remove unnecessary characters

Fonts quite often include a huge amount of different characters (called glyphs).
As I am the author of this site, I know that I most likely won't need any
special or uncommon characters, so I can reduce the file sizes of my fonts by
[subsetting the files](https://the-sustainable.dev/a-guide-to-subsetting-fonts/).
I am quite certain that all this site needs are the
[Basic Latin](<https://en.wikipedia.org/wiki/Basic_Latin_(Unicode_block)>) and
[Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement)
[Unicode blocks](https://en.wikipedia.org/wiki/Unicode_block).

A nice way to accomplish this is the
[`fontTools`](https://github.com/fonttools/fonttools) library, which can be
installed globally with `pip install fonttools`. The following invocation
subsets a font file with the unicode range of Basic Latin and Latin-1
Supplement:

```sh
pyftsubset "{INPUT_FILE}.woff2" \
    --output-file="{OUTPUT_FILE}.woff2" \
    --unicodes="U+0000-00FF" \
    --layout-features="*" \
    --flavor="woff2"
```

This time, after running it on all of our files, we have the following results:

| Variant   | Size (all glyphs) | Size (subset) |
| --------- | ----------------- | ------------- |
| Upright   | `48kb`            | `30kb`        |
| Italic    | `52kb`            | `32kb`        |
| Mono      | `28kb`            | `15kb`        |
| **Total** | `128kb`           | `84kb`        |

A third of the file sizes gone, quite a good improvement!

## Step 3: but why 3?

For this site, even though we stylistically have just a single typeface, we are
using three font files for it. Both of the previous optimizations could also
have been done with Google Fonts, as when embedding fonts it provides `.woff2`
instead of `.ttf` by default, and the
[subsets can also be specified manually](https://developers.google.com/fonts/docs/getting_started#specifying_script_subsets).
However, there is no technical reason for us to actually need three separate
font files; we could have the italic typeface be an additional
[variation axis](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide#introducing_the_variation_axis)
adjacent to the weight. In addition, as hinted earlier, as I only want tabular
numbers and the CSS style property for this is fittingly called
[`font-variant-numeric`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric),
suggesting that we could have all of this available as yet another variant
included in the same font.

The same `fontTools` is also a full Python library in addition to a bunch of
command-line tools. I hadn't previously tried programming with it, but as I knew
that what I wanted was possible and I could easily verify a working solution,
this was a perfect match for an LLM-generated throwaway script. After a little
bit of prompting and debugging, I managed to get what I wanted as long as I
started over with the `.ttf` files, and then redid the steps 1 and 2 for the
script's merged font output.

<details>
<summary>Show the python script</summary>

If you have [`uv`](https://docs.astral.sh/uv/) installed, this script can be
simply run with `./script.py` thanks to the shebang and
[PEP 723](https://peps.python.org/pep-0723/).

```python
#!/usr/bin/env -S uv run
# /// script
# dependencies = [
#   "fonttools==4.59.2",
# ]
# ///

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
import os

def merge_fonts():
    # Font paths
    regular_font_path = "input/AtkinsonHyperlegibleNext-VariableFont_wght.ttf"
    tabular_font_path = "input/AtkinsonHyperlegibleMono-VariableFont_wght.ttf"
    italic_font_path = "input/AtkinsonHyperlegibleNext-Italic-VariableFont_wght.ttf"
    output_path = "output/AtkinsonHyperlegibleNext-Merged.ttf"

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Load the fonts
    regular_font = TTFont(regular_font_path)
    tabular_font = TTFont(tabular_font_path)
    italic_font = TTFont(italic_font_path)

    # Get the 'GSUB' table from fonts
    regular_gsub = regular_font.get('GSUB')
    tabular_gsub = tabular_font.get('GSUB')
    italic_gsub = italic_font.get('GSUB')

    # Add GSUB rules for italic alternates
    if italic_gsub and 'GSUB' in regular_font:
        regular_font['GSUB'].table.LookupList.Lookup.extend(italic_gsub.table.LookupList.Lookup)


    # Add 'ital' axis to fvar table if it doesn't exist
    if 'fvar' in regular_font:
        has_ital = False
        for axis in regular_font['fvar'].axes:
            if axis.axisTag == 'ital':
                has_ital = True
                break

        if not has_ital and 'fvar' in italic_font:
            for axis in italic_font['fvar'].axes:
                if axis.axisTag == 'ital':
                    regular_font['fvar'].axes.append(axis)
                    break

    # Add italic glyphs with different names
    italic_glyphs = set(italic_font.getGlyphOrder()) - set(regular_font.getGlyphOrder())
    for glyph_name in italic_glyphs:
        # Add italic glyph with a .italic suffix
        regular_font['glyf'][glyph_name + '.italic'] = italic_font['glyf'][glyph_name]

    # Update name table to reflect combined nature
    for name in regular_font['name'].names:
        if name.nameID in [1, 3, 4, 6]:  # Family name, Unique ID, Full name, PostScript name
            if name.platformID == 3:  # Windows platform
                name.string = (name.string.decode('utf-16-be') + " Combined").encode('utf-16-be')
            else:
                name.string = (name.string.decode('utf-8') + " Combined").encode('utf-8')

    if regular_gsub and tabular_gsub:
        # Add tabular number feature if not present
        for script in tabular_gsub.table.ScriptList.ScriptRecord:
            for lang in script.Script.LangSysRecord:
                if 'tnum' not in lang.LangSys.FeatureIndex:
                    lang.LangSys.FeatureIndex.append('tnum')

        # Merge the GSUB tables
        if hasattr(tabular_gsub.table, 'FeatureList'):
            for feature in tabular_gsub.table.FeatureList.FeatureRecord:
                if feature.FeatureTag == 'tnum':
                    regular_gsub.table.FeatureList.FeatureRecord.append(feature)

    # Save the modified font
    regular_font.save(output_path)
    print(f"Font saved to {output_path}")

if __name__ == "__main__":
    merge_fonts()

```

</details>

Finally, our end result is a single `.woff2` file with a file size of `30kb`,
basically giving us the Italic and Mono for free! I am not entirely sure how it
can be smaller than the plain Italic file (`32kb`), but I couldn't see any
visual differences in the combined font's italics compared to the standalone
Italic font, so we'll just have to leave it as an exercise for the reader :)

## Conclusion

We managed to get from a naive `292kb`, three-request custom font payload (or,
to be more fair to Google Fonts' defaults, a `128kb` three-request one) to just
`30kb` single-request one, which should make this site more pleasant to use at
least for people on mobile connections! For proof, just look at the network tab
and the variety of typography on this site.
