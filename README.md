# TO-DO-application

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# REST-API
### REST requestst
```
GET '/api/todos'
```
returns id, description, week number and state (done/not done) within the desider time period in JSON-format

```
POST '/api/add/:id'
```
adds a new task into tasks-table by giving the task all of the following:
id, description, week number and state (done/not done)

