import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  const [hourlyWage, setHourlyWage] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [isAm, setIsAm] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startDateTime, setStartDateTime] = useState(null);

  // Set default selected time to current time and date to today
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const displayHours = hours % 12 || 12;
    const am = hours < 12;
    
    setSelectedTime(`${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    setIsAm(am);
    
    // Set default date to today in YYYY-MM-DD format
    const today = now.toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const calculatePerSecond = (wage) => {
    const num = parseFloat(wage);
    return isNaN(num) || num <= 0 ? 0 : num / 3600;
  };

  const createStartTime = () => {
    const [hoursStr, minutesStr] = selectedTime.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    let actualHours = hours;
    if (!isAm) {
      if (hours < 12) actualHours = hours + 12;
    } else {
      if (hours === 12) actualHours = 0;
    }

    // Parse the selected date
    const [year, month, day] = selectedDate.split('-').map(Number);
    
    // Create the start datetime object
    const startTime = new Date(year, month - 1, day, actualHours, minutes, 0, 0);
    return startTime;
  };

  const startTracking = () => {
    if (!hourlyWage || parseFloat(hourlyWage) <= 0) return;
    if (!selectedDate) return;

    const startTime = createStartTime();
    const now = new Date();

    if (startTime > now) {
      alert('Selected date and time is in the future. Please choose a time that has already passed.');
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getElapsedTime = () => {
    if (!startDateTime) return { hours: 0, minutes: 0 };

    const now = new Date();
    const millisecondsElapsed = now - startDateTime;
    const hours = Math.floor(millisecondsElapsed / (1000 * 60 * 60));
    const minutes = Math.floor((millisecondsElapsed % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  const elapsed = getElapsedTime();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💰 Earnings Tracker</Text>

        {!isRunning ? (
          <View style={styles.form}>
            <Text style={styles.label}>Hourly Wage ($):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 25.50"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={hourlyWage}
              onChangeText={setHourlyWage}
            />

            <Text style={styles.label}>Start Date:</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              keyboardType="numbers-and-punctuation"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
            <Text style={styles.note}>Format: YYYY-MM-DD (e.g., 2024-12-01)</Text>

            <Text style={styles.label}>Start Time:</Text>
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                placeholderTextColor="#888"
                keyboardType="numbers-and-punctuation"
                value={selectedTime}
                onChangeText={setSelectedTime}
                maxLength={5}
              />
              <View style={styles.ampmContainer}>
                <TouchableOpacity
                  style={[styles.ampmButton, isAm && styles.ampmButtonActive]}
                  onPress={() => setIsAm(true)}
                >
                  <Text style={[styles.ampmText, isAm && styles.ampmTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmButton, !isAm && styles.ampmButtonActive]}
                  onPress={() => setIsAm(false)}
                >
                  <Text style={[styles.ampmText, !isAm && styles.ampmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.selectedTimeDisplay}>
              Selected: {selectedDate} at {selectedTime} {isAm ? 'AM' : 'PM'}
            </Text>

            <TouchableOpacity
              style={[styles.button, (!hourlyWage || parseFloat(hourlyWage) <= 0 || !selectedDate) && styles.buttonDisabled]}
              onPress={startTracking}
              disabled={!hourlyWage || parseFloat(hourlyWage) <= 0 || !selectedDate}
            >
              <Text style={styles.buttonText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tracker}>
            <Text style={styles.status}>✅ Tracking Earnings...</Text>
            <Text style={styles.timeText}>Started: {formatDate(startDateTime)} at {formatTime(startDateTime)}</Text>
            <Text style={styles.timeText}>Current: {formatDate(new Date())} at {formatTime(new Date())}</Text>
            <Text style={styles.timeText}>Elapsed: {elapsed.hours}h {elapsed.minutes}m</Text>

            <Text style={styles.earningsLabel}>Total Earned:</Text>
            <Text style={styles.earningsAmount}>${earnings.toFixed(6)}</Text>

            <TouchableOpacity style={styles.resetButton} onPress={resetTracking}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.infoText}>Earnings per second: ${calculatePerSecond(hourlyWage).toFixed(6)}</Text>
        </View>
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
    marginBottom: 10,
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  timeContainer: {
    flexDirection: 'row',
    width: '80%',
    gap: 10,
    marginBottom: 15,
  },
  timeInput: {
    flex: 2,
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  ampmContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  ampmButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmButtonActive: {
    backgroundColor: '#4CAF50',
  },
  ampmText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ampmTextActive: {
    color: '#000',
  },
  selectedTimeDisplay: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
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
  },
  earningsLabel: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 20,
  },
  earningsAmount: {
    color: '#BB86FC',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 10,
    width: 120,
    alignItems: 'center',
  },
  info: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  note: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});