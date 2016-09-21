'use strict';
const Executor = require('screwdriver-executor-base');
const path = require('path');
const Fusebox = require('circuit-fuses');
const request = require('request');
const tinytim = require('tinytim');
const yaml = require('js-yaml');

class K8sExecutor extends Executor {

    /**
     * Constructor
     * @method constructor
     * @param  {Object} options                  Configuration options
     * @param  {String} options.token            Api Token to make requests with
     * @param  {String} options.host             Kubernetes hostname to make requests to
     * @param  {String} [options.launchVersion]  Launcher container version to use (latest)
     * @param  {String} [options.logVersion]     Log Service container version to use (latest)
     * @param  {String} [options.serviceAccount] Service Account to use (default)
     */
    constructor(options) {
        super();

        this.token = options.token;
        this.host = options.host;
        this.launchVersion = options.launchVersion || 'latest';
        this.logVersion = options.logVersion || 'latest';
        this.serviceAccount = options.serviceAccount || 'default';
        this.jobsUrl = `https://${this.host}/apis/batch/v1/namespaces/default/jobs`;
        this.podsUrl = `https://${this.host}/api/v1/namespaces/default/pods`;
        this.breaker = new Fusebox(request);
    }

    /**
     * Starts a k8s build
     * @method start
     * @param  {Object}   config            A configuration object
     * @param  {String}   config.buildId    ID for the build
     * @param  {String}   config.container  Container for the build to run in
     * @param  {String}   config.apiUri     API Uri
     * @param  {String}   config.token      JWT for the Build
     * @return {Promise}
     */
    _start(config) {
        const jobTemplate = tinytim.renderFile(path.resolve(__dirname, './config/job.yaml.tim'), {
            build_id: config.buildId,
            container: config.container,
            api_uri: config.apiUri,
            token: config.token,
            launcher_version: this.launchVersion,
            log_version: this.logVersion,
            service_account: this.serviceAccount
        });

        const options = {
            uri: this.jobsUrl,
            method: 'POST',
            json: yaml.safeLoad(jobTemplate),
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            strictSSL: false
        };

        return new Promise((resolve, reject) => {
            this.breaker.runCommand(options, (err, resp) => {
                if (err) {
                    return reject(err);
                }

                if (resp.statusCode !== 201) {
                    const msg = `Failed to create job: ${JSON.stringify(resp.body)}`;

                    return reject(new Error(msg));
                }

                return resolve(null);
            });
        });
    }

    /**
     * Stop a k8s build
     * @method stop
     * @param  {Object}   config            A configuration object
     * @param  {String}   config.buildId    ID for the build
     * @return {Promise}
     */
    _stop(config) {
        const options = {
            uri: this.jobsUrl,
            method: 'DELETE',
            qs: {
                labelSelector: `sdbuild=${config.buildId}`
            },
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            strictSSL: false
        };

        return new Promise((resolve, reject) => {
            this.breaker.runCommand(options, (err, resp) => {
                if (err) {
                    return reject(err);
                }

                if (resp.statusCode !== 200) {
                    const msg = `Failed to delete job: ${JSON.stringify(resp.body)}`;

                    return reject(new Error(msg));
                }

                return resolve(null);
            });
        });
    }

    /**
    * Retreive stats for the executor
    * @method stats
    * @param  {Response} Object          Object containing stats for the executor
    */
    stats() {
        return {
            requests: {
                total: this.breaker.getTotalRequests(),
                timeouts: this.breaker.getTimeouts(),
                success: this.breaker.getSuccessfulRequests(),
                failure: this.breaker.getFailedRequests(),
                concurrent: this.breaker.getConcurrentRequests(),
                averageTime: this.breaker.getAverageRequestTime()
            },
            breaker: {
                isClosed: this.breaker.isClosed()
            }
        };
    }
}

module.exports = K8sExecutor;
