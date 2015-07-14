$(document).ready(function(){
  setInterval( get, 5000 );
  get();
  $('.roomnames').change(function() {
    $('.message').hide();
    selectedRoom = $('select option:selected').attr('value');
    $('.' + selectedRoom).show();
  });
  $('.messagebox').submit(function(event) {
    event.preventDefault();
    var text = $(this).find('input[name=message]').val();
    var username = window.location.search.match(/(&|\?)username=([^&\?]*)/)[2];
    var msg = new Message({username: username, text: text, roomname: selectedRoom});
    msg.send();
    $(this).find('input[name=message]').val('');
  }); 
  $('.roomcreate').submit(function(event) {
    event.preventDefault();
    var roomName = $(this).find('input[name=createroom]').val();
    $('.roomnames').append($('<option></option>').attr('value', escape(roomName)).text(roomName));
    $(this).find('input[name=createroom]').val('');
    alert("Room created, please select it from the drop-down menu!");
  });
  $('.chatspace').on('click', 'span.username', function() {
    friends[$(this).text()] = true;
    alert('friend added');
  });
});


var messageIds = {};
var rooms = {};
var friends = {};
var selectedRoom;

var escape = function(string){
  return string ? string.replace(/(&|'|"|<|>| )/, "_") : '';
};

var Message = function(data){
  var messageData = data;
  this.createdAt = new Date();
  this.username = (data.username);
  this.text = (data.text);
  this.roomname = (data.roomname);
  //Need to make username bold.
  this.$ = $('<div class="message"><span class="username"></span>: <span class="text"></span></div>')
    .addClass(escape(this.roomname));
  this.$.find('.username').text(this.username);
  this.$.find('.text').text(this.text);

  if (friends[this.username]) {
    this.$.addClass('friend');
  }
   
 $('.chatspace').prepend(this.$);
  if (!rooms[this.roomname]){
    rooms[this.roomname] = true;
    $('.roomnames').append($('<option></option>').attr('value', escape(this.roomname)).text(this.roomname));
  }
  if (escape(this.roomname) !== selectedRoom) {
    this.$.hide();
  }
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
      messageIds[data.objectId] = true;
      console.log('chatterbox: Message sent');
    },
    error: function (error) {
      console.error(error);
    }
  });
};

var get = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      _.each(data.results.reverse(), function(message){
        if (!(message.objectId in messageIds) && message.text){
          messageIds[message.objectId] = true;
          new Message(message);
          console.log("Message received.");
        }
      });
    },
    error: function (error) {
      console.error(error);
    }
  });
};