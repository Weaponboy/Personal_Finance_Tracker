import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../FirebaseConfig';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Login useEffect triggered - User:', user, 'Loading:', loading);
        if (!loading && user) {
            console.log('Redirecting to home due to existing user');
            router.replace('/');
        }
    }, [user, loading]);

    const handleLogin = async () => {
        console.log('handleLogin called - Email:', email, 'Password:', password);
        if (!email || !password) {
            console.log('Error: Email or password is empty');
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting to sign in with Firebase');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign-in successful - User:', userCredential.user);
            console.log('Navigating to home');
            router.replace('/');
        } catch (error) {
            console.log('Sign-in error:', error.message, 'Code:', error.code);
            Alert.alert('Error', error.message);
        }
    };

    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
});