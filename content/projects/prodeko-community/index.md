---
title: Prodeko Community
startYear: 2021
---

- requirements

    - seminar platform
    - text, embedded audio, embedded video
    - non-technical administration
    - login integration with existing oauth
    - internationalization
    - content search
    - tight schedule & budget

- implementation

    - initial design with figma
    - nextjs frontend, directus backend
    - deployment on vm with docker & ansible
    - search with meili
    - embeds from spotify & youtube
    - login wih prodeko oauth
    - comments and replies
    - reactions with flourish

- learnings
    - full project management

In the spring of 2021, a friend of mine was volunteering for the annual ball
committee of [Aalto University's](https://www.aalto.fi/) Industrial Engineering
and Management's (IEM) student guild [Prodeko](https://prodeko.org/). The guild
has a tradition of hosting a seminar for students and alumni alike on the same
week as the ball, and this year they got an idea for a web platform that would
facilitate the event with talks, blogs, podcasts and discussions. The friend had
seen me develop our guild's website and other small projects (such as Kiltisbot)
and knew of my related work experience, so they asked me if I was available for
contracting such a platform.

Naturally I accepted; this presented me with a great opportunity for learning,
as I had previously only worked as a software consultant/contractor as a part of
a team, with an agency managing large parts of the customer interactions.

## Requirements

Luckily for me, the customer – a joint group from both Prodeko and the
[Aalto department of IEM](https://www.aalto.fi/en/department-of-industrial-engineering-and-management)
– had quite clear vision and requirements for the platform. It needed to
support:

- text, audio and video content;
- internationalization of the content (at least finnish and english);
- content administration by non-technical users;
- full-text search of the content;
- likes and comments for the content and
- authentication for commenting with pre-existing OAuth2 infrastructure.

Most of these I already had experience with but others, like full-text search, I
hadn't implemented before. After discussing the details with the client, I gave
them a quote which included a quick design sprint at the start to hone the
overall layout and visuals of the website. They accepted, and I was off to the
races.

## Design sprint

As there were no proper designs for the platform yet, rather individual design
elements such as logos and banners, I felt the need to propose some visual
drafts right before starting to work on the application itself. I created an
initial design using [Figma](https://www.figma.com/), implementing basic
interactivity like navigation and mock commenting to better pitch what I had in
mind. There were few guidelines besides supporting the pre-existing assets, so I
focused on creating a simple UI with focus on the content itself. This would
also lend itself to reusing the platform on later years with simply just
replacing colors, banners and similar assets.

After I was done with the initial design I demoed it to the clients, asking for
comments. They mostly consisted of changes to specific words used, as they were
quite satisfied with the presented visuals and functionality. After a round of
refining, based on comments received, I started the proper development.

![Screenshot of the Figma design file for Prodeko Community, showing all of the different screens side by side.](design-sprint.png "I've noticed that properly using Components in Figma really helps in organizing the actual frontend code later on.")

## Development

As the schedule and budget for the project were really tight, there was no way
of creating everything from scratch (without even considering the infeasibility
anyways).

![Animated gif of a user pressing the "rainbow-like" button, after which the initially grayscale rainbow emoji bursts outwards with colorful sparks and the rainbow itself gains its colors.](rainbow-like.webp "The only thing more satisfying than programming these micro-interactions is using them afterwards :)")
