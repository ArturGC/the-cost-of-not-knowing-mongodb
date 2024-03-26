"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    apps: [
        {
            autorestart: true,
            exec_mode: 'cluster',
            instances: 4,
            max_memory_restart: '1024M',
            name: 'server',
            script: './build/index.js',
            watch: false,
            env: {
                EXEC_ENV: 'prod',
            },
        },
    ],
};
