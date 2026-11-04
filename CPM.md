# CPM books

`cpm/<book>.js` lays out one CPM Core Connections book, chapter by chapter and lesson by lesson, and
points each lesson at the Procademy skills that practice it. The chapter and lesson numbers come from
CPM's public homework-help site and are checked against `tests/cpm-lessons.json`. Nothing from the
books themselves is copied: titles are a table of contents, topics are our own one-line summaries, and
every lesson links to CPM's homework help for the real problems.

```js
ACADEMY.cpmBook({
  id: 'int2',                                   // cc1 | cc2 | cc3 | int1 | int2 | int3
  title: 'Core Connections Integrated II', short: 'Integrated II',
  band: 'High school', grade: 10, icon: 'CCII', hue: 330,
  homework: 'https://homework.cpm.org/category/CCI_CT/textbook/int2',
  sources: ['https://…'],                       // where the chapter and lesson titles came from
  chapters: [
    { n: 1, title: 'Exploring Algebraic and Geometric Relationships', lessons: [
      { id: '1.1.1', title: 'Attributes of Polygons',
        topic: 'Naming polygons by their sides and angles, and what makes one regular.',
        skills: ['math7.angle-pairs'] },
    ] },
  ],
});
```

- **title**: the lesson's title in the book, or `null` when no public source gives it. Never guess one.
- **topic**: our own summary of what the lesson teaches, 12–160 characters, written for a student.
- **skills**: 0–4 existing skill ids, the best match first, from any course. Leave it empty rather than
  link a skill that does not practice the lesson.

Check a book with `node tests/cpm.js cpm/<book>.js`.
