## ![](https://github.com/Xiong1028/pictures/blob/master/tripinterestLogo.png?raw=true)Travel website sever

![](<https://img.shields.io/badge/Build-passing-green.svg>)![](<https://img.shields.io/badge/FrontEnd-React-brightgreen.svg>)![](<https://img.shields.io/badge/BackEnd-Express-yellow.svg>)![](<https://img.shields.io/badge/DataBase-MongoDB-blue.svg>)![](<https://img.shields.io/badge/Licence-GPL-orange.svg>)



> This project version as a private project was originally contrtolled by GitLab. Now it becomes open-source repository in GitHub. It has already been deployed at [https://tripinterest.tk](https://tripinterest.tk)



**The travel website project** is dedicated to build a platform for users to share their trip experiences and stories, which consists of the following two repositories: 

- **travel_website_client**
- **travel_website_server**

Main **Features**  include reading users diaries, posting article, basic authentication, users registration,searching,comments,profile setting, resetting password,uploading avatar,instant message and more.

Here is <u>*the server side*</u>, which is used to design `RESTful API` for the client side and do `CURD` data operation in the database. 

 ***built with***

- [express](https://expressjs.com/en/api.html)  ~4.16.0
- [mongoose](https://mongoosejs.com/docs/api.html) ^5.4.3
- [async](https://caolan.github.io/async/docs.html)  ^2.6.2
- [blueimp-md5](https://github.com/blueimp/JavaScript-MD5) ^2.10.0
- [cookie-parser](https://github.com/expressjs/cookie-parser)  ^1.4.3
- [socket.io](https://socket.io/docs/) ^2.2.0



### Getting Started

------

##### Prerequisites

The project runs in [Nodejs](<https://nodejs.org/en/>) environment. it requires:

-  [Nodejs](https://nodejs.org/en/)  v 10.0 or later
-  [npm](https://www.npmjs.com/)  v 6.0 or later
- [MongoDB](https://www.mongodb.com/) v 3.0 or later



##### Installing

> Note: The server project needs to work with [travel website client ](https://github.com/Xiong1028/travel_website_server), Please make sure MongoDB service is running.

```linux
$ git clone git@github.com:Xiong1028/travel_website_server.git
$ cd travel_website_server
$ npm install
$ npm run 
```

the development mode will be running at `localhost:3001`



##### Deploying

Step 1: In the [travel website client](https://github.com/Xiong1028/travel_website_client) project, using the following to build the whole client side package into a `build` directory.

```linux
$ npm run-script build
```

![](https://github.com/Xiong1028/pictures/blob/master/build.png?raw=true)

Step 2: Create a `client` directory in the home path, Move the whole `build` directory from travel website client project under the `client` dirctory in travel website server project.



Step 3: Set the static path in `app.js` 

```javascript
app.use(express.static(path.join(__dirname, 'client/build')));
```



##### Testing

Test the whole project at `localhost:3000 or localhost:3001`



### Licensing

------

This project is under `GNU/GPL` license.

