module.exports = {
  apps: [
    {
      name: "univoo-co-ovmon",
      cwd: "/www/wwwroot/univert.pro",
      script: "./node_modules/.bin/next",
      args: "start -H 127.0.0.1 -p 3100",
      interpreter: "/www/server/nodejs/v22.22.0/bin/node",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3100",
      },
    },
  ],
};
