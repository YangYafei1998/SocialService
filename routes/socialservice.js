var express = require('express');
var router = express.Router();
var moment = require('moment');
var Promises = require('promise');
var cookieParser = require('cookie-parser');

router.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Assignment2' });
});

/*
 * POST to sign in.
 */
router.post('/signin', function(req, res) {
    var db = req.db;
	var userList = db.get('userList'); 
	var postList = db.get('postList');
	var commentList = db.get('commentList');

	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	var username = req.body.username;
	var password = req.body.password;

	userList.findOne({ name: username, password: password }, function(err, docs){
        if(docs) {
            res.cookie('userId', docs._id);
            //update lastCommentRetrievalTime
            var filter = { "_id": docs._id};
            var newTime = moment(Date.now()).format('H:mm:ss ddd MMMM DD YYYY');
    		userList.update(filter, { $set: {"lastCommentRetrievalTime": newTime}}, function (err, result) {

    		})

    		//find the information of friends
    		let friendsInfo = [];
    		let friendsPosts = [];
    		let friendsComments = [];
    		var promise1 = new Promise(function(resolve, reject) {
				docs.friends.forEach(function(friend){
	    			userList.findOne({_id: friend.friendId}, function(err, info) {
	    				//console.log(info);
	    				if(info){
	    					friendsInfo.push({
	    						"_id": info._id,
	    						"name": info.name,
	    						"icon": info.icon,
	    						"starredOrNot": friend.starredOrNot
	    					});
	    					resolve("promise1");
	    				}else{
	    					console.log("fail to find "+friend.friendId + " in userList");
	    				}
	    			});
	    		});
			});
			
			var promise2 = new Promise(function(resolve, reject) {
				docs.friends.forEach(function(friend){
	    			postList.find({userId: friend.friendId}, function(err, posts) {
	    				if(posts){
	    					friendsPosts = friendsPosts.concat(posts);
	    					resolve("promise2");
	    				}else{
	    					console.log("fail to find "+friend.friendId + "post in postList");
	    				}
	    			});

	    		});
			});

			promise2.then(function(value){
				return new Promise(function(resolve, reject){
					commentList.find({}, function(err, comments) {
						if (comments) {
							friendsComments = friendsComments.concat(comments);
							resolve("commentPromise");
						} else {
							console.log("fail to find comment of post "+ post._id);
						}
					});
				});
			}).then(function(value){
				
				friendsPosts.sort(function(post1, post2){
					
					if (moment(post1.time,"H:mm:ss ddd MMMM DD YYYY").isValid() == false ){
						console.log(post1.time+" is not in right format(post1)");
					} 
					if (moment(post2.time,"H:mm:ss ddd MMMM DD YYYY").isValid() == false ){
						console.log(post2.time+" is not in right format(post2)");
					}
					if (moment(post1.time, "H:mm:ss ddd MMMM DD YYYY")> moment(post2.time, "H:mm:ss ddd MMMM DD YYYY")) {
						return true;
					}else {
						return false;
					}
				});
				friendsComments.sort(function(comment1, comment2){					
					if (moment(comment1.postTime,"H:mm:ss ddd MMMM DD YYYY").isValid() == false ){
						console.log(comment1.postTime+" is not in right format(comment1)");
					} 
					if (moment(comment2.postTime,"H:mm:ss ddd MMMM DD YYYY").isValid() == false ){
						console.log(comment2.postTime+" is not in right format(comment2)");
					}
					if (moment(comment1.postTime, "H:mm:ss ddd MMMM DD YYYY")> moment(comment2.postTime, "H:mm:ss ddd MMMM DD YYYY")) {
						
						return true;
					}else {
						
						return false;
					}
				});
				
				res.json({
	    			"msg" : '',
	    			"_id": docs._id,
	    			"name": docs.name,
	    			"icon": docs.icon,
	    			"friends": friendsInfo,
	    			"posts": friendsPosts,
	    			"comments": friendsComments
	    		});
			}).catch( error => {
    			console.error( 'onRejected function called: ' + error.message );
  			});
			
    		
        } else {//no match of provided username and password
        	res.send({msg: req.body.username+req.body.password+'Login failure'});
            console.log("Not found: " + username + " with password " + password);
        }
    });
});

router.get('/updatestar/:id', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var userList = db.get('userList');
	var friendId = req.params.id;
	var filter = { "_id": userId};
	let newfriends = [];
	var promise1 = new Promise(function(resolve, reject){
		userList.findOne(filter, function(err, user) {
			user.friends.forEach(function(friend){
				if (friend.friendId == friendId) {
					if(friend.starredOrNot == 'Y') {
						newfriends.push({
							"friendId": friend.friendId,
							"starredOrNot": 'N'
						})
					} else {
						newfriends.push({
							"friendId": friend.friendId,
							"starredOrNot": 'Y'
						})
					}
				} else {
					newfriends.push({
						"friendId": friend.friendId,
						"starredOrNot": friend.starredOrNot
					})
				}
			});
			resolve("promise1");
		});
	});
	promise1.then(function(value){
		userList.update(filter, { $set: {friends: newfriends}}, function(err, result){
			console.log(newfriends);
			res.json({
    			"msg" : '',
    			"newfriends": newfriends	
	    	});
		})
	}).catch( error => {
		console.error( 'onRejected function called: ' + error.message );
	});
	
	
})
router.get('/getuserprofile', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var userList = db.get('userList');
	var filter = { "_id": userId};
	userList.findOne(filter, function(err, user){
		res.json({
			"msg" : '',
			"name": user.name,
			"icon": user.icon,
			"mobileNumber": user.mobileNumber,
			"homeNumber": user.homeNumber,
			"address": user.address
		});
	});
});
router.post('/saveuserprofile', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var userList = db.get('userList');
	var mobileNumber = req.body.mobileNumber;
	var homeNumber = req.body.homeNumber;
	var address = req.body.address;
	var filter = { "_id": userId};
	userList.update(filter, { $set: {"mobileNumber": mobileNumber, "homeNumber": homeNumber, "address": address}}, function(err, result){
		res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
	});
	

});
router.get('/logout', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var userList = db.get('userList');
	var filter = { "_id": userId};
	userList.update(filter, { $set: {lastCommentRetrievalTime: ''}}, function (err, result) {});
	res.clearCookie('userId');
	res.send({msg: ''});
})
router.post('/postcomment/:postId', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var commentList = db.get('commentList');
	var currentTime = moment(Date.now()).format('H:mm:ss ddd MMMM DD YYYY');
	commentList.insert({
		"postId": req.params.postId,
		"userId": userId,
		"postTime": currentTime,
		"comment": req.body.userComment,
		"deleteTime": ''
	}, function(err, result){
		
		commentList.find({}, function(err, comments) {
			if (comments) {
				comments.sort(function(comment1, comment2){
					if (moment(comment1.postTime, "H:mm:ss ddd MMMM DD YYYY")> moment(comment2.postTime, "H:mm:ss ddd MMMM DD YYYY")) {
						return true;
					}else {
						return false;
					}
				});
				res.json(
		             { "msg": '', "newComments": comments } 
		        );
			} else {
				console.log("fail to find comment of post ");
			}
		});
		
	});
})
router.get('/deletecomment/:commentId', function(req, res){
	res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var commentList = db.get('commentList');
	var currentTime = moment(Date.now()).format('H:mm:ss ddd MMMM DD YYYY');
	commentList.update({ "_id": req.params.commentId}, { $set: {"deleteTime": currentTime}},function(err, result){
		commentList.find({}, function(err, comments) {
			if (comments) {
				comments.sort(function(comment1, comment2){
					if (moment(comment1.postTime, "H:mm:ss ddd MMMM DD YYYY")> moment(comment2.postTime, "H:mm:ss ddd MMMM DD YYYY")) {
						return true;
					}else {
						return false;
					}
				});
				res.json(
		            { "newComments": comments }
				);
			} else {
				console.log("fail to find comment of post ");
			}
		});
		
	})
})
router.get('/loadcommentupdates', function(req, res){
		res.set({
		"Access-Control-Allow-Origin": "http://localhost:3000", 
		"Access-Control-Allow-Credentials": "true",
	});
	if(req.cookies.userId){
		var userId = req.cookies.userId;
	} else {
		console.log("cookies is not set");
	}
	var db = req.db;
	var userList = db.get('userList');
	var commentList = db.get('commentList');
	var currentTime = moment(Date.now()).format('H:mm:ss ddd MMMM DD YYYY');
	userList.update({"_id": userId}, { $set: {"lastCommentRetrievalTime": currentTime}}, function(err, result){
		commentList.find({}, function(err, comments) {
			if (comments) {
				comments.sort(function(comment1, comment2){
					if (moment(comment1.postTime, "H:mm:ss ddd MMMM DD YYYY")> moment(comment2.postTime, "H:mm:ss ddd MMMM DD YYYY")) {
						return true;
					}else {
						return false;
					}
				});
				res.json(
		            { "newComments": comments }
				);
			} else {
				console.log("fail to find comment of post ");
			}
		});
	})
})
/*
 * Handle preflighted request
 */
router.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

module.exports = router;
