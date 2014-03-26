
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

module.exports = Generator;


function Generator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
}

util.inherits(Generator, yeoman.generators.Base);


Generator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  console.log(this.yeoman);
  console.log('Yeoman Generator for Assemble.');

  var prompts = [{
    type: 'list',
    name: 'pkg',
    message: 'Select a Framework:',
    choices: [{
      name: 'Foundation',
      value: 'foundation'
    }, {
      name: 'FeTeam',
      value: 'feteam'
    }]
  }];

  this.prompt(prompts, function (answers) {

    this.kickstartPackage = answers.pkg;

    cb();
  }.bind(this));
};

Generator.prototype.app = function app() {

  this.copy('package.json', 'package.json');

  this.mkdir('app');

  console.log( this.kickstartPackage );

  if (this.kickstartPackage == 'feteam') {
    this.directory('feteam', 'app');
  }

  if (this.kickstartPackage == 'foundation') {
    this.directory('foundation', 'app');
  }
};

Generator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

Generator.prototype.projectfiles = function projectfiles() {
  this.copy('README.md', 'README.md');
  this.copy('_editorconfig', '.editorconfig');
  this.copy('_jshintrc', '.jshintrc');
};
