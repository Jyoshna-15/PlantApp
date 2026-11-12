import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function Results({ navigation, route }) {
  const {
    plantName, soilType, moisture,
    profile, health, soilNote, interval, schedule,
  } = route.params || {};

  // Opened without data (e.g. from a deep link)
  if (!health) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.empty}>No analysis yet. Go back and enter your plant details.</Text>
      </View>
    );
  }

  const soilLabel = soilType.charAt(0).toUpperCase() + soilType.slice(1);

  return (
    <ScrollView style={{ backgroundColor: '#D1FFBD' }} contentContainerStyle={styles.container}>
      {/* HEALTH RESULT */}
      <View style={[styles.statusCard, { backgroundColor: health.color }]}>
        <Text style={styles.statusTitle}>{health.status}</Text>
        <Text style={styles.statusMsg}>{health.message}</Text>
        <Text style={styles.statusSmall}>
          {profile.name || plantName} in {soilLabel} soil: {moisture}% moisture{'\n'}
          Healthy range: {health.range.min}% to {health.range.max}%
        </Text>
      </View>

      {/* PLANT INFO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{profile.name || plantName}</Text>

        {!profile.found && (
          <Text style={styles.notice}>
            {profile.error
              ? "Couldn't reach the plant database, so a general estimate was used."
              : 'No plant data found for this name, so a general estimate was used.'}
          </Text>
        )}

        {profile.found && !profile.waterKnown && (
          <Text style={styles.notice}>
            This plant has no water data in the database, so a general estimate was used.
          </Text>
        )}

        {profile.image && (
          <Image source={{ uri: profile.image }} style={styles.image} resizeMode="cover" />
        )}

        {profile.scientificName && (
          <Text style={styles.italic}>{profile.scientificName}</Text>
        )}
        {profile.description && (
          <Text style={styles.body}>{profile.description}</Text>
        )}

        {profile.water && <Row label="Water" value={profile.water} />}
        {profile.light && <Row label="Light" value={profile.light} />}
        {profile.soilTolerance && <Row label="Soils it tolerates" value={profile.soilTolerance} />}
        {profile.hardiness && <Row label="Hardiness zone" value={profile.hardiness} />}
        {profile.warning && <Row label="Warning" value={profile.warning} />}
      </View>

      {/* SOIL COMPATIBILITY */}
      {soilNote && (
        <View style={[styles.card, { backgroundColor: soilNote.ok ? '#e8f8ee' : '#fdf0d5' }]}>
          <Text style={styles.cardTitle}>{soilNote.ok ? 'Soil is a good fit' : 'Soil mismatch'}</Text>
          <Text style={styles.body}>{soilNote.message}</Text>
        </View>
      )}

      {/* NEXT WATERING */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Watering plan</Text>
        <Text style={styles.body}>
          Water about every {interval} days.
          {schedule && schedule.length > 0 ? ` Next: ${schedule[0].date}.` : ''}
        </Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.button}>
        <TouchableOpacity
          style={styles.switch}
          onPress={() => navigation.navigate('Calender', { schedule, plantName: profile.name || plantName })}
        >
          <Text>View Watering Calender</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.switch1} onPress={() => navigation.navigate('Profile')}>
          <Text>About the App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 12,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusMsg: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
  },
  statusSmall: {
    fontSize: 13,
    color: '#fff',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#d1dfff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  notice: {
    backgroundColor: '#fdf0d5',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 13,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginVertical: 8,
  },
  italic: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#b5c3e6',
    marginTop: 6,
  },
  rowLabel: {
    fontWeight: 'bold',
    flex: 1,
  },
  rowValue: {
    flex: 1.4,
    textAlign: 'right',
  },
  button: {
    flexDirection: 'row',
    marginTop: 4,
  },
  switch: {
    backgroundColor: '#3DED97',
    padding: 10,
    borderRadius: 15,
    width: 180,
    marginBottom: 10,
    margin: 5,
  },
  switch1: {
    backgroundColor: '#3DED97',
    padding: 10,
    borderRadius: 15,
    width: 130,
    marginBottom: 10,
    margin: 5,
  },
});