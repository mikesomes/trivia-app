import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState([]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);

    let tries = 0;
    let newQuestion = null;

    while (tries < 5) {
      try {
        const res = await fetch(`https://trivia-app-dusky.vercel.app/api/trivia?difficulty=1`);
        const data = await res.json();

        const alreadyAsked = askedQuestions.some(q => q.question === data.question);
        if (!alreadyAsked) {
          newQuestion = data;
          break;
        } else {
          tries++;
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load question.');
        break;
      }
    }

    if (newQuestion) {
      setCurrentQuestion(newQuestion);
      setAskedQuestions(prev => [...prev, newQuestion]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = (selected) => {
    if (!currentQuestion) return;

    const isCorrect = selected === currentQuestion.correct;

    if (isCorrect) {
      const addedScore = currentQuestion.difficulty === 1 ? 5 : currentQuestion.difficulty === 2 ? 10 : 20;
      setScore(score + addedScore);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak % 10 === 0) {
        setLives(lives + 1);
      }

      fetchQuestion();
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setStreak(0);

      if (remainingLives <= 0) {
        setGameOver(true);
      } else {
        fetchQuestion();
      }
    }
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    setGameOver(false);
    setAskedQuestions([]);
    fetchQuestion();
  };

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOver}>Game Over</Text>
        <Text style={styles.score}>Final Score: {score}</Text>
        <TouchableOpacity onPress={resetGame} style={styles.button}>
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score} | Lives: {lives} | Streak: {streak}</Text>
      <Text style={styles.question}>{currentQuestion.question}</Text>
      {currentQuestion.choices.map((choice, idx) => (
        <TouchableOpacity key={idx} style={styles.choiceButton} onPress={() => handleAnswer(choice)}>
          <Text style={styles.choiceText}>{choice}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  question: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  choiceButton: { backgroundColor: '#ddd', padding: 12, borderRadius: 8, marginVertical: 6 },
  choiceText: { fontSize: 16 },
  score: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  gameOver: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  error: { textAlign: 'center', color: 'red', marginTop: 20 },
});
