
# LOLChat

A fun chat server!


## Features
- IRC like, chat with logs
- Web based, but accessible with other clients
- Text based with rich html as an extra
- Create rooms instantly with url http://hosname.com/roomname
- Anonymous or profiled users ()
- Support for bots using RESTfull services
- See who is logged and in which room
- Bots can answer commands and enrich content



# Roadmap/Sprints:

## Liquorice
- done: Multiple Room
- done: Create room from URL
- done: Object model for rooms and server
- done: Use "EventEmmiter"
- done: Implement session from this recipe: http://www.danielbaulig.de/socket-ioexpress/

## Bazooka Joe
- Support for "/" commands
- /nick nickname : to choose a nickname
- /exit : to exit a room
- /room roomname : to enter a room
- /list : list users in the room
- Show messages backlog upon joining a room
- Show status of connection in client
- Show room members upon joining

## Gobstopper
- Send a private message to a user
- Open a private room with one user
- Highlight and hyperlink #roomnames in messages (server or client?)
- Highlight and hyperlink @usernames in messages (server or client?)
- Highlight and hyperlink URLs in messages (server or client?)

## Gummy Bear
- System for RESTful bots
- Connect Hubot

## Jolly Rancher
- Persist session with Redis
- externalize the lolchat object model classes in the "lolchat" module
- load options/port config with nconf module

## Fruit by the foot
- Support for every-auth
- User authenticate with Twitter
- User authenticate with Facebook
- User authenticate with LinkedIn
- User authenticate with multiple services
- Disconnect/Connect on client


## Backlog
- Client can connect to multiple rooms (not essential because we can use multiple tabs)



# Released History

## 0.1.0
- Read-Eval-Print Loop
- Core web client
- Anonymous users (random name)


