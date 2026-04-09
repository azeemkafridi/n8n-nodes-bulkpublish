const { src, dest } = require('gulp');

function buildIcons() {
  return src(['nodes/**/icon.*', 'credentials/**/icon.*']).pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;
