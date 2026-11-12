import { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import {
  SOIL_TYPES,
  fetchPlantProfile,
  getPlantHealth,
  getSoilCompatibility,
  generateWateringSchedule,
} from '../Utils/helpCondition';

export default function Input({ navigation }) {
  const [plantName, setPlantName] = useState('');
  const [soilType, setSoilType] = useState('');
  const [moisture, setMoisture] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!plantName.trim() || !soilType || !moisture.trim()) {
      Alert.alert('Missing info', 'Please fill in plant, soil type, and moisture.');
      return;
    }

    const moistureNum = parseFloat(moisture);
    if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
      Alert.alert('Invalid moisture', 'Moisture must be a number between 0 and 100.');
      return;
    }

    setLoading(true);
    try {
      // 1) ONE API call
      const profile = await fetchPlantProfile(plantName);

      // 2) Everything else uses that same profile
      const health = getPlantHealth(moistureNum, soilType, profile);
      const soilNote = getSoilCompatibility(soilType, profile);
      const { interval, schedule } = generateWateringSchedule(soilType, profile);

      navigation.navigate('Results', {
        plantName,
        soilType,
        moisture: moistureNum,
        location,
        profile,
        health,
        soilNote,
        interval,
        schedule,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong analyzing your plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#D1FFBD' }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.box}>
        <Text style={styles.name}>Plant or crop name</Text>
        <TextInput
          placeholder="Ex.Tomato,tulip,oranges"
          style={styles.tect}
          value={plantName}
          onChangeText={setPlantName}
        />

        <Text style={styles.name}>Soil type</Text>
        <View style={styles.chipRow}>
          {SOIL_TYPES.map((s) => {
            const selected = soilType === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setSoilType(s)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.name}>Moisture %</Text>
        <TextInput
          placeholder="Ex.45"
          style={styles.tect}
          value={moisture}
          onChangeText={setMoisture}
          keyboardType="numeric"
        />

        <Text style={styles.name}>Enter location</Text>
        <TextInput
          placeholder="Ex.San Francisco,CA"
          style={styles.tect}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity style={styles.Text} onPress={handleAnalyze} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text>Analyze plant health</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#d1dfff',
    padding: 30,
    borderRadius: 20,
  },
  tect: {
    padding: 15,
    borderWidth: 2,
    borderRadius: 15,
    margin: 10,
    borderStyle: 'solid',
    borderColor: '#000000',
    width: 250,
    fontSize: 14,
  },
  name: {
    fontSize: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    marginVertical: 8,
  },
  chip: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#B1D686',
  },
  chipText: {
    fontSize: 14,
  },
  chipTextSelected: {
    fontWeight: 'bold',
  },
  Text: {
    marginTop: 15,
    backgroundColor: '#B1D686',
    padding: 15,
    borderRadius: 15,
  },
});