const _ = require('lodash');

/**
 * Class Parser
 */
class Parser {
    /**
     * Pre-process commit message
     *
     * @param {string} val
     * @return {*|Array}
     */
    preprocess(val) {
        let commits = _.split(val, "commit");

        commits = _.map(commits, (commitStr) => {
            return _.filter(
                _.map(_.split(commitStr, "\n"), _.trim),
                (commit) => !_.isEmpty(commit)
            );
        });
        return commits;
    }

    /**
     * Parse commit
     *
     * @param {String} val
     * @return {*|Array}
     */
    parse(val) {
        const commits = this.preprocess(val);

        return _.map(commits, (commit) => {
            const matches = _.get(commit, 4, '').match(/Merged in (.*) \(pull request #(\d+)/);
            const approves = _.map(_.slice(commit, 6), (approve) => _.replace(approve, 'Approved-by: ', ''));
            const messageMatches = _.get(commit, 5, '').match(/([A-Z]+)-(\d+): (.*)/);

            return {
                id: _.first(commit),
                author: _.replace(_.get(commit, 2), 'Author: ', ''),
                createdAt: _.get(commit, 3),
                mergedTo: _.get(matches, 1),
                pullRequestId: _.get(matches, 2),
                message: _.get(commit, 5),
                projectId: _.get(messageMatches, 1),
                ticket: {
                    id: _.get(messageMatches, 2),
                    message: _.get(messageMatches, 3),
                },
                approves
            }
        })
    }
}

module.exports = Parser