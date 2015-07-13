$(document).ready(function(){
  setInterval( get, 5000 );
  get();
});


var messageIds = {};

var Message = function(data){
  var messageData = data;
  this.createdAt = new Date();
  this.username = data.username;
  this.text = data.text;
  this.roomname = data.roomname;
};

Message.prototype.send = function(){
  var self = this;
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify({username: self.username, text: self.text, roomname: self.roomname}),
    contentType: 'application/json',
    success: function (data) {
      _.extend(self, data);
      console.log('chatterbox: Message sent');
    },
    error: function (error) {
      console.error(error);
    }
  });
};

Message.prototype.update = function(){
  $('.chatspace').prepend($('<div></div>').text(this.text));
};

var get = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      _.each(data.results.reverse(), function(message){
        var thisMessage = new Message(message);
        if (!(message.objectId in messageIds)){
          messagePassed = true;
          messageIds[message.objectId] = true;
          thisMessage.update();
          console.log("Message received.");
        }
      });
    },
    error: function (error) {
      console.error(error);
    }
  });
};