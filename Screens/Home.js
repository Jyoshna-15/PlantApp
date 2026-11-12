import { StyleSheet, Text, View,TouchableOpacity,ImageBackground } from 'react-native';
import { useFonts } from 'expo-font';

export default function Home({navigation}) {
//   let[fontsloaded]=useFonts({
//     BlueWater:require('../BlueWater.otf'),
//   })
    return (
       <ImageBackground source = {{uri:'https://png.pngtree.com/background/20250116/original/pngtree-nature-of-green-leaf-in-garden-at-summer-natural-leaves-plants-picture-image_15594459.jpg'}} style={{flex:1}}>
    <View style={styles.container}>
     <Text style={styles.text}> Welcome to FloraCore!!</Text>
     <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Input')}>
     <Text style={styles.buttonText}>Let's go! </Text>
     </TouchableOpacity>
    </View>
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
     justifyContent: 'center',
    padding: 8,
    alignItems:'center'
  },
  text:{
    fontSize:35,
    color:'green',
    fontWeight:'bold',
    textAlign:'center',
//    fontFamily:'BlueWater', 
  },
  button:{
    marginTop:15,
    backgroundColor:'#89d4b6',
    padding:10,
    borderRadius:15,
  },
  buttonText:{
    fontSize:25,
   fontFamily:'BlueWater', 

  },
  
});
