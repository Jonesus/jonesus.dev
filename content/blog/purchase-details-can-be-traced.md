---
title: “Its original purchase details can be traced”
description: A quick dive into the .epub format
slug: purchase-details-can-be-traced
favicon: 📖
published: 2025-12-04
---

I've been reading some e-books (I guess [Long Play](https://www.longplay.fi/)
would me more like an e-publication?) on
[my Kobo](https://gl.kobobooks.com/products/kobo-clara-2e) recently, and after
purchasing a new e-book
([Demokratian aika](https://www.goodreads.com/book/show/221342719-demokratian-aika))
I noticed the following disclaimer:

> Tämän kirjan on hankkinut "Joonas Palosuo". Mikäli kirjaa jaellaan
> laittomasti, sen alkuperäiset ostotiedot voidaan selvittää.

Loosely translated from Finnish, it reads: "This book was purchased by 'Joonas
Palosuo'. If the book is distributed illegally, its original purchase details
can be traced." Funnily enough,
[I have also partaken in writing a book](https://www.finna.fi/Record/utu.9923508697405971)
and after getting it printed, I briefly considered transpiling it into an
e-book. While researching what it would take, I came across the fact that
[`.epub`, a common format for e-books, is technically just a `.zip` file](https://en.wikipedia.org/wiki/EPUB).
Recalling this made me wonder; what mechanism _would_ they use for tracing my
purchase?

## Digging in

The first part of the puzzle was getting to inspect the data of the book, which
was as simple as running:

<details>
<summary><code>unzip book.epub</code> (expand for output)</summary>

```sh
   creating: OEBPS/
  inflating: OEBPS/Koottu-17.xhtml
  inflating: OEBPS/Koottu-9.xhtml
  inflating: OEBPS/Koottu-15.xhtml
  inflating: OEBPS/Koottu-11.xhtml
  inflating: OEBPS/Koottu-13.xhtml
   creating: OEBPS/css/
  inflating: OEBPS/css/idGeneratedStyles.css
  inflating: OEBPS/Koottu.xhtml
  inflating: OEBPS/Koottu-14.xhtml
  inflating: OEBPS/Koottu-8.xhtml
  inflating: OEBPS/Koottu-16.xhtml
  inflating: OEBPS/Koottu-12.xhtml
  inflating: OEBPS/Koottu-10.xhtml
  inflating: OEBPS/toc.xhtml
   creating: OEBPS/image/
  inflating: OEBPS/image/Kansi.jpg
  inflating: OEBPS/image/01_Jean_Pichore_Lady_Fortune_and_her_Wheel.jpg
  inflating: OEBPS/image/04_Hans_Holbein_the_Younger_The_Ambassadors.jpg
  inflating: OEBPS/image/02_Das_Jungste_Gericht_Memling.jpg
  inflating: OEBPS/image/08_AKG1837525.jpg
  inflating: OEBPS/image/06_AKG5882441.jpg
  inflating: OEBPS/image/05_BAL_3937512.jpg
  inflating: OEBPS/image/07_BAL_4652448.jpg
  inflating: OEBPS/image/03_Sandro_Botticelli_021.jpg
  inflating: OEBPS/image/Titteli.jpg
  inflating: OEBPS/Koottu-2.xhtml
  inflating: OEBPS/content.opf
  inflating: OEBPS/cover.xhtml
  inflating: OEBPS/Koottu-6.xhtml
  inflating: OEBPS/Koottu-4.xhtml
  inflating: OEBPS/Koottu-18.xhtml
  inflating: OEBPS/Koottu-3.xhtml
   creating: OEBPS/font/
  inflating: OEBPS/font/ArnoPro-Italic.otf
  inflating: OEBPS/font/ArnoPro-Regular.otf
  inflating: OEBPS/font/Times-Italic.ttc
  inflating: OEBPS/font/ProximaNova-Bold.ttc
  inflating: OEBPS/font/ArnoPro-Bold.otf
  inflating: OEBPS/Koottu-1.xhtml
  inflating: OEBPS/toc.ncx
  inflating: OEBPS/Koottu-5.xhtml
  inflating: OEBPS/Koottu-7.xhtml
   creating: META-INF/
  inflating: META-INF/container.xml
  inflating: META-INF/encryption.xml
```

</details>

Immediately, the file `META_INF/encryption.xml` caught my eye. Unfortunately, it
contained nothing of interest:

```xml
<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:enc="http://www.w3.org/2001/04/xmlenc#">
    <enc:EncryptedData>
        <enc:EncryptionMethod Algorithm="http://www.idpf.org/2008/embedding" />
        <enc:CipherData>
            <enc:CipherReference URI="OEBPS/font/ArnoPro-Bold.otf" />
        </enc:CipherData>
    </enc:EncryptedData>
    <enc:EncryptedData>
        <enc:EncryptionMethod Algorithm="http://www.idpf.org/2008/embedding" />
        <enc:CipherData>
            <enc:CipherReference URI="OEBPS/font/ArnoPro-Italic.otf" />
        </enc:CipherData>
    </enc:EncryptedData>
    <enc:EncryptedData>
        <enc:EncryptionMethod Algorithm="http://www.idpf.org/2008/embedding" />
        <enc:CipherData>
            <enc:CipherReference URI="OEBPS/font/ArnoPro-Regular.otf" />
        </enc:CipherData>
    </enc:EncryptedData>
</encryption>
```

After checking the actual [specification for EPUB](https://www.w3.org/TR/epub),
[It seems that this file is only used for font obfuscation](https://www.w3.org/TR/epub/#sec-container-abstract-intro).
In addition, the folder didn't contain a `rights.xml`, which would seem like
another good candidate according to the spec.

I followed up by looking into the files in `OEBPS` folder, which seemed to
contain the actual book. There, in each of the `.xhtml` files, I could find a
familiar snippet:

```xml
<!-- Tämän kirjan on hankkinut "Joonas Palosuo". Mikäli kirjaa jaellaan laittomasti, sen alkuperäiset ostotiedot voidaan selvittää. -->
```

With a quick `grep -r . -e 'Joonas Palosuo'` I confirmed that each of the
`.xhtml` files indeed contained this as a kind of a watermark, although some
also had the same disclaimer in a `<p>` tag to be rendered by e-book readers. It
might be that this is the main way of linking the e-book to its purchaser.

## Digging deeper

Looking through the rest of the files, I noticed the `OEBPS/content.opf` having
an identifier tag containing an UUID:

```xml
<dc:identifier id="bookid">urn:uuid:0DA5BA3D-8F0F-449F-B890-AF53D886CD02</dc:identifier
```

The
[metadata specification for `<dc:identifier>`](https://www.w3.org/TR/epub/#sec-opf-dcidentifier)
doesn't really suggest that this should be used for identifying individual
`.epub` files, but id doesn't forbid it either. Furthermore, the authors have
not used the book's [ISBN](https://en.wikipedia.org/wiki/ISBN)
(978-952-363-555-5) here, even though it would make sense as the value of the
identifier.

This theory has my curiosity piqued, so if anyone else has purchased the same
e-book I would love to know if the identifier is the same for you! Otherwise, if
I like the book enough after reading it, I might just have to buy it with a
separate account for a second time to test my hypothesis.

Stay tuned!
