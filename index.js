const fs = require('fs');
const mkdirp = require('mkdirp');
const Mustache = require('mustache');

mkdirp.sync('site');
const template = fs.readFileSync('./template.mst', 'utf8');

const sourceData = [
  { id: 's-s1-s2-a', name: 'Discourse of the Master', universeId: 's-s1-s2-a', universeName: 'Master universe' },
  { id: 's1-s2-a-s', name: 'Discourse of the University', universeId: 's-s1-s2-a', universeName: 'Master universe' },
  { id: 's2-a-s-s1', name: 'Discourse of the Analyst', universeId: 's-s1-s2-a', universeName: 'Master universe' },
  { id: 'a-s-s1-s2', name: 'Discourse of the Hysteric', universeId: 's-s1-s2-a', universeName: 'Master universe' },

  { id: 's1-s-s2-a', universeId: 's1-s-s2-a' },
  { id: 's-s2-a-s1', universeId: 's1-s-s2-a' },
  { id: 's2-a-s1-s', universeId: 's1-s-s2-a' },
  { id: 'a-s1-s-s2', universeId: 's1-s-s2-a' },

  { id: 's-s1-a-s2', universeId: 's-s1-a-s2' },
  { id: 's1-a-s2-s', universeId: 's-s1-a-s2' },
  { id: 'a-s2-s-s1', universeId: 's-s1-a-s2' },
  { id: 's2-s-s1-a', universeId: 's-s1-a-s2' },

  { id: 'a-s1-s2-s', universeId: 'a-s1-s2-s' },
  { id: 's1-s2-s-a', universeId: 'a-s1-s2-s' },
  { id: 's2-s-a-s1', universeId: 'a-s1-s2-s' },
  { id: 's-a-s1-s2', universeId: 'a-s1-s2-s' },

  { id: 's-s2-s1-a', universeId: 's-s2-s1-a' },
  { id: 's2-s1-a-s', universeId: 's-s2-s1-a' },
  { id: 's1-a-s-s2', universeId: 's-s2-s1-a' },
  { id: 'a-s-s2-s1', universeId: 's-s2-s1-a' },

  { id: 's1-s-a-s2', universeId: 's1-s-a-s2' },
  { id: 's-a-s2-s1', universeId: 's1-s-a-s2' },
  { id: 'a-s2-s1-s', universeId: 's1-s-a-s2' },
  { id: 's2-s1-s-a', universeId: 's1-s-a-s2' },
];

const htmlTerm = t => {
  const dict = {
    's': 's',
    's1': 's<sub>1</sub>',
    's2': 's<sub>2</sub>',
    'a': 'a',
  };

  return dict[t];
}

const prettifyQuadripode = q => {
  return `<sup>${htmlTerm(q[0])}</sup>/<sub>${htmlTerm(q[1])}</sub> ` + 
    `<sup>${htmlTerm(q[2])}</sup>/<sub>${htmlTerm(q[3])}</sub>`;
};

const discourses = sourceData.map(discourse => {
  const q = discourse.id.split('-');
  const universeQuadripod = discourse.universeId.split('-');

  const asciiQuadripod = `${q[1]}/${q[0]} ${q[2]}/${q[3]}`;

  return Object.assign({}, discourse, {
    quadripodHtml: prettifyQuadripode(q),
    asciiQuadripod,
    universeHtml: prettifyQuadripode(universeQuadripod),
    clockwise: [q[3], q[0], q[1], q[2]].join('-'),
    clockwiseHtml: prettifyQuadripode([q[3], q[0], q[1], q[2]]),
    antiClockwise: [q[1], q[2], q[3], q[0]].join('-'),
    antiClockwiseHtml: prettifyQuadripode([q[1], q[2], q[3], q[0]]),
    reverseSelf: [q[1], q[0], q[2], q[3]].join('-'),
    reverseSelfHtml: prettifyQuadripode([q[1], q[0], q[2], q[3]]),
    reverseOther: [q[0], q[1], q[3], q[2]].join('-'),
    reverseOtherHtml: prettifyQuadripode([q[0], q[1], q[3], q[2]]),
    reverseSignifiers: [q[0], q[2], q[1], q[3]].join('-'),
    reverseSignifiersHtml: prettifyQuadripode([q[0], q[2], q[1], q[3]]),
    reverseSignifieds: [q[3], q[1], q[2], q[0]].join('-'),
    reverseSignifiedsHtml: prettifyQuadripode([q[3], q[1], q[2], q[0]]),
  });
});

const instructions = discourses.map(discourse => {
  const html = Mustache.render(template, discourse);

  return {
    fileName: `${discourse.id}.html`,
    html,
  };
});

instructions.forEach(instruction => {
  const filePath = `./site/${instruction.fileName}`;
  console.log(`Writing file ${filePath}`);
  fs.writeFileSync(filePath, instruction.html);
});