const yargs = require("yargs")
const ApiClient = require('../ApiClient/client')
const Table = require("cli-table")
const prompts = require("prompts")
const colors = require('colors')
const netrc = require("netrc")
const config = netrc()


yargs
    //global options that is available to all commands.
    .options("endpoint", {
        alias: "e",
        default: `http://localhost:1337`,
        describe: "The endpoint of the API."
    })
    .options('author', {
        default: 'Uko Chibuike Malachi',
        describe: "Author of the cli program."
    })

    //NOTE: The command function takes 4 arguments, a command(string literal), a description, an options object and a function to be invoked when the command is type in the command line.
    .command('list-posts',
        "Get a list of posts", {
        //the following below are more like arguments to the commands
        skip: {
            alias: "s",
            default: "1",
            type: " number",
            describe: "The number posts to offset/skip"
        },
        limit: {
            alias: "l",
            default: "9",
            type: "number",
            describe: " The number of posts to return"
        }
    },
        //function the command should run.
        listProducts
    )

    //if you look closely you would notice that the command has "view-post <id>" signature. This would enforce that the command is passed an argument that would be passed to the viewPost function as an object with property of "id" e.g {id: XXXXXXXXXXX}
    .command('view-post <id>',
        "view single post",
        {},
        viewPost)
    .command('edit-post <id>',
        "Edit a post",
        {
            key: {
                alias: "k",
                describe: "property to be edited"
            },
            value: {
                alias: "v",
                describe: "the new value of the edited property"


            }
        },
        editPost
    )
    .command("login", "Login to API", {}, login)
    .command("logout", "Logout of API", {}, logout)
    .command("whoami", "Check login status", {}, whoami)
    .help()
    .demandCommand(1, "You must provide atleast one command.")
    .parse()


async function listProducts(opts) {
    try {
        const { skip, limit } = opts
        const posts = await ApiClient.cliGetPosts({ skip, limit })

        const header = ["S/N", "_id", "posts", "postDate", "version-number",]
        const margin = header.length
        const width = process.stdout.columns - margin
        const widthId = 30
        const widthOther = Math.floor((width - widthId) / header.length - 1)

        const table = new Table({
            head: header,
            colWidths: [widthOther, widthId, widthOther, widthOther, widthOther]
        })


        posts.forEach((data, index) => {
            table.push([`${index + 1}`, data._id, data.post, data.postDate, data.__v,])
        })

        console.log(table.toString())
    } catch (error) {
        console.error(`\n${error.name || "Error"}: `, error.message)
    }

}


async function viewPost(opts) {
    try {
        const { id, endpoint } = opts

        const res = await ensureLoggedIn(endpoint)
        if (!res) {
            console.log(`Please login to continue.`)
            return
        }

        const post = await ApiClient.cliViewPost({ id })
        const header = ["KEY", "VALUE"]
        const cols = process.stdout.columns - 12
        const widthId = 30

        const table = new Table({
            head: header,
            colWidths: [widthId, cols - widthId]
        })
        Object.keys(post).forEach(key => {
            table.push([key, post[key]])
        })


        console.log(table.toString())
    } catch (error) {
        console.error(`\n${error.name || "Error"}: `, error.message)
    }

}


async function editPost(opts) {
    try {
        const { id, key, value, endpoint } = opts
        const edit = { [key]: value }

        const res = await ensureLoggedIn(endpoint)
        if (!res) {
            return console.log(`Please login to continue.`)
        }

        const editedPost = await ApiClient.cliEditPost({ id, edit })

        viewPost({ id: editedPost._id, endpoint })
    } catch (error) {
        console.error(`\n${error.name || "Error"}: `, error.message)
    }
}

async function login(opts) {
    const { endpoint } = opts
    try {
        const { username, password } = await prompts([
            {
                name: "username",
                type: "text",
                message: colors.brightYellow(`What is your username?`)
            },
            {
                name: "password",
                type: "password",
                message: colors.brightYellow(`What is your password?`)
            }
        ])

        const token = await ApiClient.cliLogin({ username, password })

        saveConfig({ username, endpoint, token })

        console.log(colors.cyan(`\nYou successfully login as ${username}`))

        return token
    } catch (error) {
        const isRetry = await shouldRetry(error)
        if (isRetry) {
            login({ endpoint })
        } else {
            return null
        }
    }

}
async function whoami(opts) {
    const { endpoint } = opts
    const url = new URL(endpoint)
    const userLoggedIn = config[url.host].login

    console.log(userLoggedIn ? colors.yellow(`You're logged in as ${userLoggedIn}`) : colors.yellow(`You're not currently logged in.`))
}

function saveConfig(opts) {
    try {
        const { username = "", endpoint = "", token } = opts
        const url = new URL(endpoint)
        config[url.host] = { login: username, password: token }
        netrc.save(config)
    } catch (error) {
        console.error(`\n${error.name || "Error"}: `, error.message)
    }

}

async function logout(opts) {
    try {
        const { endpoint } = opts
        const url = new URL(endpoint)
        config[url.host] = { username: undefined, password: undefined }
        netrc.save(config)
        console.log(colors.magenta(`You're currently logged out.`))
    } catch (error) {
        console.error(`\n${error.name || "Error"}: `, error.message)
    }
}


async function ensureLoggedIn(endpoint) {
    const url = new URL(endpoint)
    let authToken = config[url.host]["password"]

    if (authToken) return authToken

    authToken = await login({ endpoint })
    return authToken
}

async function shouldRetry(error) {
    const { status = "" } = error.response || {}
    const message = status == 401 ? `incorrect username or password` : error.messge

    const { retry } = await prompts([
        {
            name: "retry",
            type: "confirm",
            message: colors.red(`${message} Retry?`)
        }
    ])

    return retry
}