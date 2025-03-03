---
title: Kiltisbot
startYear: 2015
githubLink: https://github.com/inkubio/kiltisbot
---

Since 2014, when I began studying bioinformation technology at Aalto University,
the student association (a.k.a. guild), Inkubio, started organizing its group
chats in Telegram due to
[WhatsApp having too limited group sizes](https://www.nairaland.com/1995896/whatsapp-group-member-increases-50).
Around 2015,
[Telegram released an API for creating chat bots](https://telegram.org/blog/bot-revolution),
and as I had just learned basic programming in python, I had to try and create
something with it.

There was a time when one could take a sneak peek at Inkubio's club room (guild
room; kiltahuone; kiltis) via a web cam attached above the door: the webcam
periodically uploaded a picture to the guild's website. This was quite
convenient for checking whether you had any friends there for studying, playing
Smash Bros or drinking coffee with. Checking the website was simple enough, but
solitary; accessing and sharing the photos via Telegram in private or group
chats would be much more exiting!

The bot was but a simple python script, fetching the same file as the website
displayed, forwarding it to a chat where a user requested the bot to "/stalk". I
like to believe that the cultural impact was significant though, as whenever
there was a problem with the bot, I would promptly be messaged with "jonesus pls
fix". It felt really good to have created something quite simple, providing
others with great (or at least sufficient) joy and utility.

Later on I got the inspiration from other guilds' IRC chats, where one could
save other users' messages without any burden of unnecessary context with an
"/addquote"-command, so that the messages could later be relived with "/quote"
for sensible chuckles. The complexity of the bot subsequently skyrocketed, from
a simple script relaying pictures from one corner of the internet to another, to
needing to store state in an sqlite database. Luckily the course for relational
algebra was not far from memory, so back then even I could manage a database
with a single table.

Other developments included open source contributions from guild members, such
as adding the ability to check what was playing on the guild room's Spotify by
prompting "/robin", requesting a puujalkavitsi (kind of a dad joke) with
"/puuta".
