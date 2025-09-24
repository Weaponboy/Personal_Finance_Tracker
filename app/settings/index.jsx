import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logout, useAuth } from '../../lib/AuthContext';


const Settings = () => {

    const router = useRouter();
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        console.log('Attempting logout');
        await logout();
        // Redirect to login manually if needed (optional, as useEffect in Login will handle it)
        if (!loading && !user) {
            console.log('Redirecting to login after logout');
            router.replace('/login');
        }
    };

    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return <View style={styles.container}>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 90,
        backgroundColor: '#fff'
    },
    logout: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 10,
        backgroundColor: "#000000",
        borderRadius: 12
    },
    logoutText: {
        color: '#fff'
    }
})

export default Settings;