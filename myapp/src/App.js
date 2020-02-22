import React from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import Cookies from 'js-cookie';
import Moment from 'react-moment';

class FrontApp extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hascookie: false,
      loginFailed: false,
      _id: '',
      username: '',
      name: '',
      password: '',
      icon: '',
      friends: '',
      posts: '',
      comments: '',
      showPosts: true,
      mobileNumber: '',
      homeNumber:'',
      address:'',
      friendId: ''
    };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleMobileNumberChange = this.handleMobileNumberChange.bind(this);
    this.handleHomeNumberChange = this.handleHomeNumberChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.saveUserProfile = this.saveUserProfile.bind(this);
    this.updateStar = this.updateStar.bind(this);
    this.postComment = this.postComment.bind(this);
    this.handleUserCommentChange = this.handleUserCommentChange.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  handleUsernameChange(username) {
    this.setState({
      username: username
    })
  }
  handlePasswordChange(password) {
    this.setState({
      password: password
    })
  }
  handleSignIn(e){
    e.preventDefault();
    if (this.state.username === '' || this.state.password === '') {
      alert("please fill in all fields");
    } else {
      $.ajax({
        type: "POST",
        data: { 
          "username" : this.state.username, 
          "password" : this.state.password
        },
        url: "http://localhost:3001/signin",
        dataType: 'json',
        xhrFields: {withCredentials: true}
      }).done(function (data) {
        if (data.msg === '') {
          this.setState({
            hascookie: true,
            _id: data._id,
            name: data.name,
            icon: data.icon,
            friends: data.friends,
            posts: data.posts,
            comments: data.comments,
            password: '',
            username: ''
          });
        } else {
          this.setState({loginFailed: true});
        }
      }.bind(this)
      );
    }
  }
  handleLogout(e){
    e.preventDefault();
    $.ajax({
        type: "GET",
        url: "http://localhost:3001/logout",
        dataType: 'json',
        xhrFields: {withCredentials: true}
      }).done(function (data) {
        if (data.msg === '') {
          this.setState({
            hascookie: false,
            showPosts: true,
            loginFailed: false
          })
          
        } else {
          alert(data.msg);
        }
      }.bind(this)
      );

  }
  updateStar(e) {
    var friendToUpdateStar = e.target.alt;
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/updatestar/"+friendToUpdateStar,
      dataType: 'json',
      xhrFields: {withCredentials: true}
    }).done(function (data) {
      if (data.msg === '') {
        let newfriends = [];
        this.state.friends.map((friend) => {
          if (friend._id == friendToUpdateStar){
            if (friend.starredOrNot == 'Y'){
              newfriends.push(
                {
                  "_id": friend._id,
                  "name": friend.name,
                  "icon": friend.icon,
                  "starredOrNot": 'N'
                }
              );
            } else {
              newfriends.push(
                {
                  "_id": friend._id,
                  "name": friend.name,
                  "icon": friend.icon,
                  "starredOrNot": 'Y'
                }
              );
            }
          } else {
            newfriends.push(friend);
          }
        })
        this.setState({
          friends: newfriends
        });
        
      } else {
        alert(data.msg);
      }
    }.bind(this)
    );
  }
  handleMobileNumberChange(mobileNumber) {
    this.setState({
      mobileNumber: mobileNumber
    })
  }
  handleHomeNumberChange(homeNumber) {
    this.setState({
      homeNumber: homeNumber
    })
  }
  handleAddressChange(address) {
    this.setState({
      address: address
    })
  }
  saveUserProfile (e) {
    e.preventDefault();
    $.ajax({
      type: "POST",
      data: { 
        "mobileNumber" : this.state.mobileNumber, 
        "homeNumber" : this.state.homeNumber,
        "address": this.state.address
      },
      url: "http://localhost:3001/saveuserprofile",
      dataType: 'json',
      xhrFields: {withCredentials: true}
    }).done(function (data) {
      if (data.msg === '') {
        this.setState({showPosts: true})
      } else {
        alert(data.msg);
      }
    }.bind(this)
    );

  }
  getUserProfile(e) {
    e.preventDefault();
    $.ajax({
        type: "GET",
        url: "http://localhost:3001/getuserprofile",
        dataType: 'json',
        xhrFields: {withCredentials: true}
      }).done(function (data) {
        if (data.msg === '') {
          this.setState({
            showPosts: false,
            mobileNumber: data.mobileNumber,
            homeNumber: data.homeNumber,
            address: data.address
          });
        } else {
          alert(data.msg);
        }
      }.bind(this)
      );
  }
  postComment(e) {
    if(e.keyCode == 13) {
      e.preventDefault();
      var comment;
      this.state.userComment.map((pair) => {
        if (pair.postId == e.target.name) {
          comment = pair.comment;
        }
      });
      if (comment == '') {
        alert("Please enter your comment");
      } else {
        $.ajax({
          type: "POST",
          data: { 
            "userComment" : comment
          },
          url: "http://localhost:3001/postcomment/"+e.target.name,
          dataType: 'json',
          xhrFields: {withCredentials: true}
        }).done(function (data) {
          if (data.msg === '') {
            this.setState({
              comments: data.newComments,
            })
          } else {
            alert(data.msg);
          }
        }.bind(this)
        );
      }
      
    }
    
  }
  handleUserCommentChange(e){
    let newUserComment = this.state.userComment;
    if (newUserComment == undefined) {
      newUserComment = [{
        "postId": e.target.name,
        "comment": e.target.value
      }];
      
    } else {
      
      var exist = false;
      newUserComment.map((pair) => {
        if (pair.postId == e.target.name) {
          exist = true;
          pair.comment = e.target.value;
        } 
      });
      if (!exist){
        newUserComment = newUserComment.concat({
        "postId": e.target.name,
        "comment": e.target.value
      });
      }
    }
    
    this.setState({
      userComment: newUserComment
    })
  }
  deleteComment(e) {
    e.preventDefault();
    var confirmation = window.confirm('Delete the message?');
    if (confirmation === true){
      $.ajax({
        type: "GET",
        url: "http://localhost:3001/deletecomment/"+e.target.id,
        dataType: 'json',
        xhrFields: {withCredentials: true}
      }).done(function (data) {
        this.setState({
          comments: data.newComments,
        })
      }.bind(this)
      );
    }
    

  }
  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      9000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    $.ajax({
      type: "GET",
      url: "http://localhost:3001/loadcommentupdates",
      dataType: 'json',
      xhrFields: {withCredentials: true}
    }).done(function (data) {
      this.setState({
        comments: data.newComments
      })
    }.bind(this)
    );
  }

  render() {
    if (!this.state.hascookie) {
      return (
        <div className ="wrapper">
          <h1>Friends</h1>
          <LoginFailureInfomation
          loginFailed = {this.state.loginFailed}
          />
          <LoginPage
          username = {this.state.username}
          password = {this.state.password}
          onUsernameChange={this.handleUsernameChange}
          onPasswordChange={this.handlePasswordChange}
          handleSignIn={this.handleSignIn}
          />
        </div>
      );
    }
    return(
      <div>
        <h1>Friends</h1>
         <MainPage
         _id = {this.state._id}
         friendId = {this.state.friendId}
         name = {this.state.name}
         icon = {this.state.icon}
         friends = {this.state.friends}
         posts = {this.state.posts}
         comments = {this.state.comments}
         showPosts = {this.state.showPosts}
         mobileNumber = {this.state.mobileNumber}
         homeNumber = {this.state.homeNumber}
         address = {this.state.address}
         userComment = {this.state.userComment}
         getUserProfile = {this.getUserProfile}
         handleLogout = {this.handleLogout}
         handleMobileNumberChange = {this.handleMobileNumberChange}
         handleHomeNumberChange = {this.handleHomeNumberChange}
         handleAddressChange = {this.handleAddressChange}
         saveUserProfile = {this.saveUserProfile}
         updateStar = {this.updateStar}
         postComment = {this.postComment}
         handleUserCommentChange = {this.handleUserCommentChange}
         deleteComment = {this.deleteComment}
        
         />
      </div>
    );
  }
}
//
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
  }
  handleUsernameChange(e) {
    this.props.onUsernameChange(e.target.value);
  }
  handlePasswordChange(e) {
    this.props.onPasswordChange(e.target.value);
  }
  handleSignIn(e) {
    this.props.handleSignIn(e);
  }

  render() { 

    return (
      <div>
        <form>
          Username <input className="input_text"
            type="text"
            value={this.props.username}
            onChange={this.handleUsernameChange}
          />
          <br/>
          Password <input className="input_text"
            type="text"
            value={this.props.password}
            onChange={this.handlePasswordChange}
          />
          <br/>
          <button className="signinButton" onClick={this.handleSignIn}>Sign in</button>         

        </form>
      </div>
    );
    
  }
}

//
class LoginFailureInfomation extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.loginFailed) {
      return (
        <p className="LoginFailureInfomation">Login Failure</p>
      );
    } else {
      return (<p/>);
    }
  }
}
//
class MainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.handleMobileNumberChange = this.handleMobileNumberChange.bind(this);
    this.handleHomeNumberChange = this.handleHomeNumberChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.saveUserProfile = this.saveUserProfile.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.updateStar = this.updateStar.bind(this);
    this.postComment = this.postComment.bind(this);
    this.handleUserCommentChange = this.handleUserCommentChange.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }
  handleLogout(e) {
    this.props.handleLogout(e);
  }
  getUserProfile(e) {
    this.props.getUserProfile(e);
  }
  handleMobileNumberChange (e) {
    this.props.handleMobileNumberChange(e);
  }
  handleHomeNumberChange (e) {
    this.props.handleHomeNumberChange(e);
  }
  handleAddressChange (e) {
    this.props.handleAddressChange(e);
  }
  saveUserProfile(e) {
    this.props.saveUserProfile(e);
  }
  updateStar(e) {
    this.props.updateStar(e);
  }
  postComment(e) {
    this.props.postComment(e);
  }
  handleUserCommentChange(e){
    this.props.handleUserCommentChange(e);
  }
  deleteComment(e) {
    this.props.deleteComment(e);
  }
  
  render() {
    return (
      <div>
        <img className="icon" src={this.props.icon} onClick={this.getUserProfile} />
        <span id="username" onClick={this.getUserProfile} >{this.props.name}</span>
        <button className="logoutButton" onClick={this.handleLogout}>Log out</button>
        <StarredFriend
         friends = {this.props.friends}
        />
        <Posts
         _id = {this.props._id}
         friendId = {this.props.friendId}
         name = {this.props.name}
         icon = {this.props.icon}
         posts = {this.props.posts}
         comments = {this.props.comments}
         friends = {this.props.friends}
         showPosts = {this.props.showPosts}
         mobileNumber = {this.props.mobileNumber}
         homeNumber = {this.props.homeNumber}
         address = {this.props.address}
         userComment = {this.props.userComment}
         handleMobileNumberChange = {this.handleMobileNumberChange}
         handleHomeNumberChange = {this.handleHomeNumberChange}
         handleAddressChange = {this.handleAddressChange}
         saveUserProfile = {this.saveUserProfile}
         updateStar = {this.updateStar}
         postComment = {this.postComment}
         handleUserCommentChange = {this.handleUserCommentChange}
         deleteComment = {this.deleteComment}
         
        />

      </div>   
    );
  }
}
//
class StarredFriend extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let rows = [];
    this.props.friends.map((friend) => {
      if (friend.starredOrNot === 'Y') {
        rows.push(
          <StarredFriendRow
            name = {friend.name}
          />
        );
      } 
    });
    
    return (      
      <div id="starredFriendList">
      <table>
        <thead>
          <tr>
            <th>Starred Friends</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      </div>
    );
    
  }
}
//
class StarredFriendRow extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const friendname = this.props.name;
    return (
      <tr>
        <td>{this.props.name}</td>
      </tr>
    );
  }
}

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      icon: this.props.icon,
    }
    this.handleMobileNumberChange = this.handleMobileNumberChange.bind(this);
    this.handleHomeNumberChange = this.handleHomeNumberChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.saveUserProfile = this.saveUserProfile.bind(this);
    this.updateStar = this.updateStar.bind(this);
    this.postComment = this.postComment.bind(this);
    this.handleUserCommentChange = this.handleUserCommentChange.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }
  handleMobileNumberChange(e) {
    this.props.handleMobileNumberChange(e.target.value);
  }
  handleHomeNumberChange(e) {
    this.props.handleHomeNumberChange(e.target.value);
  }
  handleAddressChange(e) {
    this.props.handleAddressChange(e.target.value);
  }
  saveUserProfile(e) {
    this.props.saveUserProfile(e);
  }
  updateStar(e) {
    this.props.updateStar(e);
  }
  postComment(e) {
    this.props.postComment(e);
  }

  handleUserCommentChange(e){
    this.props.handleUserCommentChange(e);
  }
  deleteComment(e) {
    this.props.deleteComment(e);
  }
  


  render() {
    let rows = [];
    this.props.posts.map((post) => {
      this.props.friends.map((friend) => {
        if (post.userId == friend._id) {
          rows.push(
            <div>
              <PostRow
              post = {post}
              name = {friend.name}
              icon = {friend.icon}
              star = {friend.starredOrNot}
              friendId = {friend._id}
              updateStar = {this.updateStar}
              />
              <Comments
              _id = {this.props._id}
              comments = {this.props.comments}
              postId = {post._id}
              friends = {this.props.friends}
              userComment = {this.props.userComment}
              postComment = {this.postComment}
              handleUserCommentChange = {this.handleUserCommentChange}
              deleteComment = {this.deleteComment}
              />
              
              <hr/>
           </div>
            
          );
        }
      })
    });
    //
    if (this.props.showPosts){
      return (      
        <div className="postsList" id = "postsList">
        <table>
          <thead>
            <tr>
              <th colSpan = "5">Posts</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        </div>
      );
    } else {
      return (
        <div className="profile">
          <p id="profileHeader">Profile</p>
          <img className="iconProfile" src={this.state.icon} />
          <p id="usernameProfile" ><span id= "usernameText">username:</span> {this.props.name}</p> 
          <p id="text_profile1">Mobile Number: </p>
          <p id="text_profile2">Home Number: </p>
          <p id="text_profile3">Address: </p> 
          <form className="profileForm">
            
            <input className="input_text_profile"
              type="text"
              placeholder = "mobileNumber"
              value={this.props.mobileNumber}
              onChange={this.handleMobileNumberChange}
            />
            <br/>
            
            <input className="input_text_profile"
              type="text"
              placeholder = "homeNumber"
              value={this.props.homeNumber}
              onChange={this.handleHomeNumberChange}
            />
            <br/> 
                      
            <input className="input_text_profile"
              type="text"
              placeholder = "address"
              value={this.props.address}
              onChange={this.handleAddressChange}
            />
            <br/>
            <button className="saveButton" onClick={this.saveUserProfile}>Save</button>         
          </form>
        </div>  
      );    
    }
  }
}
//
class PostRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name : this.props.name,
      icon : this.props.icon,
      friendId : this.props.friendId,
      star : this.props.star
    };
    this.updateStar = this.updateStar.bind(this);
  }
  updateStar(e) {
    this.props.updateStar(e);
    
  }
 

  render() {
    return (
      <div className = "onePost">
        <img className="postIcon" src={this.props.icon} />
        <span>{this.props.name}</span>
        <span>
          <Star
          star = {this.props.star}
          updateStar = {this.updateStar}
          friendId = {this.props.friendId}
          />
        </span>
        <p>{this.props.post.time}, {this.props.post.location}</p>
        <p><span id="postContent">{this.props.post.content}</span></p>   
        <br/>
      </div>
    );
  }
}
//
class Comments extends React.Component {
  constructor(props) {
    super (props);
    this.state ={
      userComment: this.props.userComment,
      comments: this.props.comments
    };
    this.postComment = this.postComment.bind(this);
    this.handleUserCommentChange = this.handleUserCommentChange.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }
  
  postComment(e) {
    this.props.postComment(e);
  }
  handleUserCommentChange(e){
    this.props.handleUserCommentChange(e);
  }
  deleteComment(e) {
    this.props.deleteComment(e);
  }
  
  
  render() {
    let rows = [];
    this.props.comments.map((comment) => {
      if (comment.postId == this.props.postId) {
        if (comment.userId == this.props._id && comment.deleteTime == ''){
          rows.push(
            <CommentRow
            comment = {comment}
            posterName = "You"
            deleteComment = {this.deleteComment}
            />
          );
        } else {
          this.props.friends.map((friend) => {
            if (friend._id == comment.userId && comment.deleteTime == ''){
              rows.push(
                <CommentRow
                comment = {comment}
                posterName = {friend.name}
                deleteComment = {this.deleteComment}
                />
              )
            }
          }); 
        }
      }
    });
    return (
    <div>
      <p>{rows}</p>
      <CommentInput
      postId = {this.props.postId}
      userComment = {this.props.userComment}
      postComment = {this.postComment}
      handleUserCommentChange = {this.handleUserCommentChange}
      />
      
      
    </div>
    );
  }
}
//
class CommentRow extends React.Component {
  constructor(props) {
    super (props);
    this.deleteComment = this.deleteComment.bind(this);
  }
  deleteComment(e) {
    
    this.props.deleteComment(e);
  }
  
  
  render() {
    if (this.props.posterName == "You") {
      return (
        <div>
          <p onDoubleClick={this.deleteComment} id={this.props.comment._id} >{this.props.comment.postTime} <span className = "commentContent" id={this.props.comment._id}>{this.props.posterName} said: {this.props.comment.comment}</span></p>
        </div>
      );
    } else {
      return (
        <div>
          <p id={this.props.comment._id} >{this.props.comment.postTime} <span className = "commentContent" id={this.props.comment._id}>{this.props.posterName} said: {this.props.comment.comment}</span></p>
        </div>
      );
    }
    
  }
}

class Star extends React.Component {
  constructor(props) {
    super(props);
    this.updateStar = this.updateStar.bind(this);
  }
  updateStar(e) {
    this.props.updateStar(e);
  }


  render() {
    const star = this.props.star;
    if (star == 'Y') {
      return (
        <img className="starIcon" src="icons/yellowStar.jpg" onClick={this.updateStar} alt={this.props.friendId}/>
      );
    } else {
      return (
        <img className="starIcon" src="icons/greyStar.jpg" onClick={this.updateStar} alt={this.props.friendId}/>
      );
    }
  }
}
//
class CommentInput extends React.Component {
  constructor(props) {
    super (props);
    this.postComment = this.postComment.bind(this);
    this.handleUserCommentChange = this.handleUserCommentChange.bind(this);
  }
  postComment(e) {
    this.props.postComment(e);
  }
  handleUserCommentChange(e){
    //this.props.handleUserCommentChange(e.target.value);
    this.props.handleUserCommentChange(e);
  }
  
  render() {
    return (
      <form onSubmit={this.postComment}>
        <input type="text" 
        className = "input_text_comment"
        placeholder = "Your Comment"
        name = {this.props.postId}
        onChange={this.handleUserCommentChange}
        onKeyDown={this.postComment} />
      </form>
    );
  }
}

export default FrontApp;
