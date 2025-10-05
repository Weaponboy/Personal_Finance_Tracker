import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fireStoreDB } from '../../FirebaseConfig';
import { logout, useAuth } from '../../lib/AuthContext';

const Settings = () => {
    const router = useRouter();
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        console.log('Attempting logout');
        await logout();
        if (!loading && !user) {
            console.log('Redirecting to login after logout');
            router.replace('/login');
        }
    };

    const handleWipeData = async () => {
        if (!user) return;

        try {
            const transactionsRef = collection(fireStoreDB, `users/${user.uid}/transactions`);
            const querySnapshot = await getDocs(transactionsRef);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            const transactionsParRef = collection(fireStoreDB, `users/${user.uid}/partiallyPaidTransactions`);
            const querySnapshotPar = await getDocs(transactionsParRef);
            const deletePromisesPar = querySnapshotPar.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromisesPar);

            const userRef = doc(fireStoreDB, `users/${user.uid}/total/${user.uid}`);
            await updateDoc(userRef, {
                Total: 0,
                GivingTotal: 0
            });

            Alert.alert('Success', 'All data has been wiped.');
        } catch (error) {
            console.error('Error wiping data:', error);
            Alert.alert('Error', 'Failed to wipe data. Please try again.');
        }
    };

    const confirmWipeData = () => {
        Alert.alert(
            'Confirm Data Wipe',
            'Are you sure you want to delete all your transactions and reset totals? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: handleWipeData,
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.wipeData} onPress={confirmWipeData}>
                <Text style={styles.wipeDataText}>Wipe All Data</Text>
            </TouchableOpacity>
        </View>
    );
};

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
    },
    wipeData: {
        position: 'absolute',
        top: 65,
        right: 15,
        padding: 10,
        backgroundColor: "#ff0000",
        borderRadius: 12
    },
    wipeDataText: {
        color: '#fff'
    }
});

export default Settings;