const fs = require('fs');
const fsExtra = require('fs-extra');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const Mustache = require('mustache');

mkdirp.sync('site/discourses');
const universeTemplate = fs.readFileSync('./universe-template.mst', 'utf8');
const discourseTemplate = fs.readFileSync('./discourse-template.mst', 'utf8');

const sourceData = [
  { id: 's-s1-s2-a' }, // 1
  { id: 'a-s-s1-s2' },
  { id: 's2-a-s-s1' },
  { id: 's1-s2-a-s' },

  { id: 'a-s1-s2-s' }, // 2
  { id: 's-a-s1-s2' },
  { id: 's2-s-a-s1' },
  { id: 's1-s2-s-a' },

  { id: 's2-s1-a-s' }, // 3
  { id: 's-s2-s1-a' },
  { id: 'a-s-s2-s1' },
  { id: 's1-a-s-s2' },

  { id: 'a-s1-s-s2' }, // 4
  { id: 's2-a-s1-s' },
  { id: 's-s2-a-s1' },
  { id: 's1-s-s2-a' },

  { id: 's-s1-a-s2' }, // 5
  { id: 's2-s-s1-a' },
  { id: 'a-s2-s-s1' },
  { id: 's1-a-s2-s' },

  { id: 's2-s1-s-a' }, // 6
  { id: 'a-s2-s1-s' },
  { id: 's-a-s2-s1' },
  { id: 's1-s-a-s2' },
];

const universeNames = ['Master universe'];
const rotations = {
  's1': 'Master',
  's': 'Hysteric',
  'a': 'Analysand',
  's2': 'University',
};

const htmlTerm = t => {
  const dict = {
    's': '$',
    's1': 'S<sub>1</sub>',
    's2': 'S<sub>2</sub>',
    'a': 'a',
  };

  return dict[t];
}

const prettifyQuadripode = q => {
  return `<table class="quadripod"><tr><td>${htmlTerm(q[1])}</td><td>${htmlTerm(q[2])}</td></tr>` +
    `<tr><td>${htmlTerm(q[0])}</td><td>${htmlTerm(q[3])}</td></tr></table>`;
};

const discourses = sourceData.map((discourse, i) => {
  const fourthQuotient = Math.floor(i/4);
  const universeId = sourceData[fourthQuotient * 4].id;

  const q = discourse.id.split('-');
  const universeQuadripod = universeId.split('-');

  const rotation = rotations[q[1]];

  const asciiQuadripod = `${q[1]}/${q[0]} ${q[2]}/${q[3]}`;

  return Object.assign({}, discourse, {
    quadripodHtml: prettifyQuadripode(q),
    asciiQuadripod,
    universeId,
    rotation,
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

const universes = _.groupBy(discourses, 'universeId');

// Universe instructions
const universeArray = _.keys(universes);
const universeInstructions = universeArray.map((universeId, universeIndex) => {
  const universeDiscourses = universes[universeId];

  const universeViewModel = Object.assign({}, { universeId }, { universeDiscourses }, {
    quadripodHtml: prettifyQuadripode(universeId.split('-')),
  });

  const html = Mustache.render(universeTemplate, universeViewModel);

  const fileName = `${universeId}.html`;
  return {
    filePath: `./site/${fileName}`,
    fileName,
    html,
  };
});


const discourseInstructions = discourses.map(discourse => {
  const html = Mustache.render(discourseTemplate, discourse);

  const fileName = `${discourse.id}.html`;
  return {
    filePath: `./site/discourses/${fileName}`,
    fileName,
    html,
  };
});


// Perform side-effects
_.flatten([universeInstructions, discourseInstructions]).forEach(instruction => {
  // console.log(`Writing file ${instruction.filePath}`);
  fs.writeFileSync(instruction.filePath, instruction.html);
});

fsExtra.copySync('./site/s-s1-s2-a.html', './site/index.html');
fsExtra.copySync('./static', './site/static');
