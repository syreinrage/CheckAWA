import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Airtable from 'airtable';
class App extends Component {

  constructor(props) {
    super(props);
    // setup default Airtable access
    var base = new Airtable({apiKey: 'keyfeN030JjIxy50V'}).base('appznIOq9Wp5AXD2c');

    this.state = {
      person: { 'Name': ''},
      id: '',
      room: '',
      director: '',
      airtable: base,
      currentUser: '',
      currentRoom: '',
      currentAssignedAD: '',
    };

    this.getUser = this.getUser.bind(this)
    this.setUser = this.setUser.bind(this)
    this.SetupRoom = this.SetupRoom.bind(this)
    this.SetupBadge = this.SetupBadge.bind(this)
    this.SetupRoomDirector = this.SetupRoomDirector.bind(this)

    this.handleChange = this.handleChange.bind(this)
    this.handleADChange = this.handleADChange.bind(this)
    this.handleRoomSetup = this.handleRoomSetup.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }
  render() {
    // var AWA_crew_member;
    var hasSetup = this.state.room !== '' && this.state.director !== '';
    var hasRoom =  this.state.room !== '';
    // const personLoaded = AWA_crew_member.fields.Name === 'Ardyn Lee';
    //  <img src={logo} className="App-logo" alt="logo" />

    return (
      <div className="App">
        <div className="App-header" />
        <div className="App-topper">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to AWA Crew Check-in</h2>

        </div>
        {!hasSetup &&
          <div>
          {!hasRoom &&
            this.SetupRoom()
          }
          {hasRoom &&
            this.SetupRoomDirector()
          }
          </div>
        }
        {hasSetup &&
          this.SetupBadge()
        }

        <div className="App-topper">
          <button className="button">
            Reset Room handleReset
          </button>


        </div>
      </div>
    );
  }

  // componentDidMount(){
  //   this.nameInput.focus();
  // }

  handleChange (e) {
    this.setState({
      currentUser: e.target.value
    })

    var currentUser = e.target.value;
    if (currentUser.length === 17) {
      // insert a pretty loading guy here that gets
      // dismissed after the setUser function completes its promise.
      this.setUser(currentUser, 'Crew', 'checkin');
    }
  }

  handleReset (e) {
    this.setState({
      person: { 'Name': ''},
      id: '',
      room: '',
      director: '',
      currentUser: '',
      currentRoom: '',
      currentAssignedAD: '',
    });
  }

  handleRoomSetup (e) {
    this.setState({
      currentRoom: e.target.value
    })

    var currentRoom = e.target.value;
    if (currentRoom.length === 17) {
      // insert a pretty loading guy here that gets
      // dismissed after the setUser function completes its promise.
      this.setRoom(currentRoom);
    }
  }
  handleADChange (e) {
    this.setState({
      currentAssignedAD: e.target.value
    })

    var currentAD = e.target.value;
    if (currentAD.length === 17) {
      // insert a pretty loading guy here that gets
      // dismissed after the setUser function completes its promise.
      this.setUser(currentAD, 'Directors', 'setup');
    }
  }

  getUser(props) {
    if (props) {
      return(
        <div>
          <h2>User {props.fields.Name} was not found. Check-in has failed</h2>
        </div>
      );
    } else {
      return(
        <div>
          <h2>User {props.fields.Name} found. Check-in has succeeded! </h2>
        </div>
      );
    }
  }

  setRoom(room){
    let currentComponent = this;

    this.state.airtable('Rooms').find(room, function(err, record) {
      if (err) {
         console.error(err);
        return;
      }

      // var AWA_room = record;
      currentComponent.setState({
        room: record.fields, // record.fields.Name,
      });
      console.log(record);
    });
  }

  setUser(user, position, type) {
    let currentComponent = this;
    if (user !== '') {
      if (type !== 'setup') {
        this.setState({
          currentUser: user
        });
      } else {
        this.setState({
          currentAssignedAD: user
        });
      }
    }
    if (user !== '') {
      this.state.airtable(position).find(user, function(err, record) {
        if (err) {
           console.error(err);
          return;
        }

        // var AWA_crew_member = record;
        if (type === 'setup') {
          currentComponent.setState({
            currentAssignedAD: '', // record.fields.Name,
            director: record.fields,
          });
        } else {
            currentComponent.setState({
              currentUser: '', // record.fields.Name,
              person: record.fields,
            });
            currentComponent.checkin(record, 'Crew');
        }
          console.log(record);
      });
    }
  }


  checkin(user, table) {
    let currentComponent = this;

    this.state.airtable(table).update(user.fields.record, {
      "Last Checked-in Room": [
        this.state.room.record
      ]
}, function(err, record) {
    if (err && table === 'Crew') {
      //try with Director table
      currentComponent.checkin(user,'Directors');
    } else if (err) {
      console.error(err);
       return;
    }
    console.log(record);
});

  }

  CheckinStatus(){
    // display Success or failure on each checkin in case re-scan is necessary

  }

  SetupRoom(){
    return(
      <div>
      <p> This room has not been registered, please scan the room registry key to begin setup</p>
      <p> Please scan your room badge to begin setup </p>
      <input
        autoFocus
        type="text"
        value={this.state.currentRoom}
        style={ { opacity: 0 }}
        onInput={this.handleRoomSetup}
        // onPaste={this.handleChange}
      />
      </div>
    );
  }

  SetupRoomDirector(){
    return(
      <div>
      <p className="App-intro">Room has been set as [ {this.state.room.Name} ], to confirm room assignment</p>
      <p> please scan a Director or AD badge</p>
      <input
        autoFocus
        type="text"
        value={this.state.currentAssignedAD}
        style={ { opacity: 0 }}
        onInput={this.handleADChange}
        // onPaste={this.handleChange}
      />
      </div>
    );
  }

  SetupBadge(){
    var success = this.state.person.Name !== '';
  return (
    <div>
      <p> Please scan your badge to check-in </p>
      <input
        autoFocus
        type="text"
        value={this.state.currentUser}
        onInput={this.handleChange}
        style={ { opacity: 0 }}

        // onPaste={this.handleChange}
      />
      <p>- Room: {this.state.room.Name} -</p>
      {success &&
        <div>
          <h2>User {this.state.person.Name} found. Check-in has succeeded! </h2>
        </div>
      }
    </div>
  );
  }
}

//director recKNRF3O3eIpzjxP
//Room recRZ5HCbOufYyWC7
//crew reckR0wQfAtYFE7zC (Bryan Walker)
export default App;
