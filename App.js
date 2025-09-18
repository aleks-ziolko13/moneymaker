import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const [hourlyWage, setHourlyWage] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startDateTime, setStartDateTime] = useState(null);

  // Set default selected time to current time and date to today
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    setSelectedTime(`${hours}:${minutes}`);

    // Set default date to today in DD/MM/YYYY format
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    setSelectedDate(`${day}/${month}/${year}`);
  }, []);

  const calculatePerSecond = (wage) => {
    const num = parseFloat(wage);
    return isNaN(num) || num <= 0 ? 0 : num / 3600;
  };

  const createStartTime = () => {
    const [hoursStr, minutesStr] = selectedTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    // Parse the selected date (DD/MM/YYYY)
    const [day, month, year] = selectedDate.split('/').map(Number);

    // Create the start datetime object
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return startTime;
  };

  const startTracking = () => {
    if (!hourlyWage || parseFloat(hourlyWage) <= 0) return;
    if (!selectedDate) return;

    const startTime = createStartTime();
    const now = new Date();

    if (startTime > now) {
      alert(
        'Selected date and time is in the future. Please choose a time that has already passed.'
      );
      return;
    }

    if (isNaN(startTime.getTime())) {
      alert(
        'Invalid date or time format. Please use DD/MM/YYYY for date and HH:MM for time.'
      );
      return;
    }

    setStartDateTime(startTime);
    setIsRunning(true);

    // Calculate initial earnings from start time to now
    const secondsElapsed = Math.floor((now - startTime) / 1000);
    const earned = calculatePerSecond(hourlyWage) * secondsElapsed;
    setEarnings(earned);
  };

  const resetTracking = () => {
    setIsRunning(false);
    setEarnings(0);
    setStartDateTime(null);
  };

  useEffect(() => {
    let interval;

    if (isRunning && startDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const secondsElapsed = Math.floor((now - startDateTime) / 1000);
        const earned = calculatePerSecond(hourlyWage) * secondsElapsed;
        setEarnings(earned);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startDateTime, hourlyWage]);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getElapsedTime = () => {
    if (!startDateTime) return { hours: 0, minutes: 0, days: 0 };

    const now = new Date();
    const millisecondsElapsed = now - startDateTime;
    const days = Math.floor(millisecondsElapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (millisecondsElapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (millisecondsElapsed % (1000 * 60 * 60)) / (1000 * 60)
    );

    return { days, hours, minutes };
  };

  const elapsed = getElapsedTime();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💰 Earnings Tracker</Text>

        {!isRunning ? (
          <View style={styles.form}>
            <Text style={styles.label}>Hourly Wage (€):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 25.50"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />

            <Text style={styles.label}>Start Date (DD/MM/YYYY):</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
              value={selectedDate}
              onChangeText={setSelectedDate}
              maxLength={10}
            />

            <Text style={styles.label}>Start Time (24-hour):</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
              value={selectedTime}
              onChangeText={setSelectedTime}
              maxLength={5}
            />

            <Text style={styles.selectedTimeDisplay}>
              Selected: {selectedDate} at {selectedTime}
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                (!hourlyWage || parseFloat(hourlyWage) <= 0 || !selectedDate) &&
                  styles.buttonDisabled,
              ]}
              onPress={startTracking}
              disabled={
                !hourlyWage || parseFloat(hourlyWage) <= 0 || !selectedDate
              }>
              <Text style={styles.buttonText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tracker}>
            <Text style={styles.status}>✅ Tracking Earnings...</Text>
            <Text style={styles.earningsLabel}>Total Earned:</Text>
            <Text style={styles.earningsAmount}>${earnings.toFixed(6)}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.timeText}>
                Started: {formatDate(startDateTime)} {formatTime(startDateTime)}
              </Text>
            </View>
           

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetTracking}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    alignItems: 'center',
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    textAlign: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedTimeDisplay: {
    color: '#C84B31',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C84B31',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tracker: {
    alignItems: 'center',
  },
  status: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  timeText: {
    color: '#ccc',
    marginBottom: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  earningsLabel: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 20,
  },
  earningsAmount: {
    color: '#519872',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#C84B31',
    padding: 12,
    borderRadius: 10,
    width: 120,
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
});
