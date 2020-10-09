const util = require('util');
const {Command} = require("commander");
const exec = util.promisify(require("child_process").exec);
const boxen = require('boxen');
const chalk = require('chalk');
const {Parser, Renderer, Processor} = require('.');

/**
 * Class Application
 */
class Application {
    /**
     * Run application
     *
     * @return {Promise<void>}
     */
    async run() {
        const program = new Command();
        program.version("0.0.1");
        program
            .requiredOption("-s, --source <path>", "Git source path")
            .requiredOption("-f, --from <hash>", "From commit hash")
            .option("-b, --branch <branch>", "Source branch")
            .option("-t, --template <path>", "Template path")
            .option("-e, --end <hash>", "End commit hash")
            .option("-m, --merge-duplicated", "Remove duplicated by ticket id");
        program.parse(process.argv);

        const source = program.source;
        let branch = program.branch || "develop";
        let endCommit = program.from;
        let startCommit = program.end || "HEAD";

        const parser = new Parser();
        const renderer = new Renderer();
        const processor = new Processor();

        console.log(boxen("GIT CHANGELOG", {padding: 1, borderStyle: 'double'}));

        const command = `cd ${source} && git fetch -p && git log origin/${branch} --merges ${startCommit}..${endCommit}`;

        console.log(chalk.blue.bold("Command: ") + command);

        const {stdout, stderr} = await exec(command);
        let commits = parser.parse(stdout);
        let defaultTemplatePath = '/../template/changelog.md.templ';

        console.log(chalk.blue("Process remove duplicated ticket id and merge messages"));

        if (program.mergeDuplicated) {
            commits = await processor.mergeByTicketId(commits);

            defaultTemplatePath = '/../template/changelog_merged.md.templ';
        }

        console.log(chalk.blue.bold("Result:"));

        const templatePath = program.template || __dirname + defaultTemplatePath;

        renderer.renderConsole(templatePath, {commits, program});
    }
}

module.exports = Application;