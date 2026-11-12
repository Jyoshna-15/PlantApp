import { StyleSheet, Text, View,TouchableOpacity,ScrollView } from 'react-native';

export default function Results({navigation}) {
  return (
    <View style={styles.container}>
    <Text style={styles.heading}>About the App </Text>
    <Text style={styles.heading}>FloraCore is a plant care application that can help gardner or plant entuisist  to help maintain the soil levels of plants </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1FFBD',
    padding: 8,
    alignItems:'center'
  },
  heading:{
marginTop:15,
fontSize:35,
fontFamily:'cursive'

  }
 

});
