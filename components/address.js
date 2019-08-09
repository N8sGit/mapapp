import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Constants, Location, Permissions } from "expo";
import { Button } from "react-native-elements";

import config from "../../constants/config";
import { headerStyles } from "../../constants/common";
import colors from "../../constants/colors";

export default class AddressComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      address: "",
      location: ""
    };
    this.textInput = React.createRef();
  }

  getText = async () => {
    let address = this.textInput.current.refs.textInput._lastNativeText;
    if (Platform.OS === "android") {
      let perm = await Location.requestPermissionsAsync();
    }
    let location = await this.getCoords(address);
    this.setState({ address, location }, () => {
      this.props.navigation.navigate("EventCreate", {
        selectedAddress: address,
        selectdLocation: location
      });
    });
  };

  getCoords = async address => {
    let location = await Location.geocodeAsync(address);

    if (location.length > 0) {
      return { lat: location[0].latitude, lng: location[0].longitude };
    } else {
      return "";
    }
  };

  setAddress = (data, details) => {
    let address = data.description;
    let location = details.geometry.location;
    this.setState({ address, location }, () => {
      this.props.navigation.navigate("EventCreate", {
        selectedAddress: this.state.address,
        selectedLocation: this.state.location
      });
    });
  };

  render() {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <NavigationEvents
          onWillBlur={() => {
            let { address } = this.state;
            if (!address) {
              this.getText();
            }
          }}
        />
        <GooglePlacesAutocomplete
          ref={this.textInput}
          placeholder="Search"
          minLength={1} // minimum length of text to search
          autoFocus={false}
          returnKeyType={"none"} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="true" // true/false/undefined
          fetchDetails={true}
          renderDescription={row => row.description} // custom description render
          onPress={(data, details = null) => {
            this.setAddress(data, details);
          }}
          getDefaultValue={() => {
            return ""; // text input default value
          }}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: googleKey,
            language: "en", // language of the results
            types: "geocode" // default: 'geocode'
          }}
          styles={{
            description: {
              fontWeight: "bold"
            },
            predefinedPlacesDescription: {
              color: "#1faadb"
            },
            container: {
              backgroundColor: "white",
              width: "100%"
            },
            textInput: {
              borderWidth: 0
            },
            textInputContainer: {
              width: "100%"
            }
          }}
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          currentLocationLabel="Current location"
          nearbyPlacesAPI="GoogleReverseGeocoding" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GoogleReverseGeocodingQuery={
            {
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }
          }
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: "distance",
            types: "food"
          }}
          debounce={200}
          renderRightButton={() => (
            <TouchableOpacity
              style={{ justifyContent: "center" }}
              onPress={this.getText}
            >
              <Text style={styles.submitBtn}>Submit</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  submitBtn: {
    color: "white",
    paddingHorizontal: 10
  }
});
