---
title: NettiS'napsi
description: Online issue of Inkubio's student magazine, S'napsi
startYear: 2017
cover: "./screenshot.png"
coverAlt:
    Screenshot of Nettisnapsi 2017 showing the list of articles with an animated
    timelapse background
githubLink: https://github.com/inkubio/nettisnapsi2017
favicon: 📰
---

The student association (a.k.a guild) for bioinformation technology in
[Aalto University](https://www.aalto.fi/), [Inkubio](https://www.inkubio.fi/),
has long published a print magazine called S'napsi. From time to time, the
editor-in-chief would grace the editorial volunteers with a call for a web
issue, and in 2017 I wanted to try my hands at the technical implementation.

As this was practically my first foray into web development, the chosen stack
was quite basic; HTML, CSS and JS. A simple website with content dynamically
hidden and shown based on [jQuery](https://jquery.com/) callbacks on `<a>` tags,
considered by few to be the peak of SPA accessibility.

In addition to the written contents, one of the main attractions was a timelapse
of our guild room, which was gathered from a web cam over a month's time.
Gathering the data was simple, as the individual screenshots were already stored
on a Linux server, so they just needed to be copied before they were rotated.
However, figuring out how to use [FFmpeg](https://www.ffmpeg.org/) to render a
huge folder of images into a video that could be reasonably embedded to a
website was a nice challenge.

Another challenge was posed from figuring out how to embed a game made with
[RPG Maker](https://en.wikipedia.org/wiki/RPG_Maker) into the website. It turned
out that RPG Maker's support for HTML5 exports was really all that is needed,
and just having it lazily load was good enough for our purposes.
