import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { fireStoreDB } from '../../FirebaseConfig';
import { logout, useAuth } from '../../lib/AuthContext';

const Settings = () => {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [openCurrently, setOpenCurrently] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Rand (R)', value: 'R' },
        { label: 'Dollar ($)', value: '$' },
        { label: 'Pound (£)', value: '£' },
    ]);

    const fadeAnim = new Animated.Value(0);

    const onOpen = () => {
        setOpenCurrently(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onClose = () => {
        setOpenCurrently(false);
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

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
                GivingTotal: 0,
                Currency: '$'
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

    const getCurrency = async () => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);
            const docSnap = await getDoc(totalRef);

            if (docSnap.exists()) {
                setValue(docSnap.data().Currency);
            }

        } catch (err) {
            console.error('Failed to update currency:', err);
            setError('Failed to update currency');
        }
    };

    const setCurrency = async (value) => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);

            await updateDoc(totalRef, {
                Currency: value,
            });

        } catch (err) {
            console.error('Failed to update currency:', err);
            setError('Failed to update currency');
        }
    };

    const onChangeValue = (newValue) => {
        setValue(newValue);
        setCurrency(value);
    };

    useEffect(() => {
        getCurrency();
    });

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

            <View style={styles.dropdownContainer}>
                <DropDownPicker
                    style={[
                        styles.dropdown,
                        { backgroundColor: openCurrently ? 'rgba(25, 150, 175, 0.89)' : 'rgba(255, 255, 255, 0.89)' }
                    ]}
                    dropDownContainerStyle={styles.dropdownMenu}
                    animationStyle={{ opacity: fadeAnim }}
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select an item"
                    onChangeValue={onChangeValue}
                    onOpen={onOpen}
                    onClose={onClose}
                />
            </View>
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
    dropdown: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#000000ff',
        width: 250,
        fontSize: 16,
        fontWeight: 500,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 20
    },
    logoutText: {
        color: '#fff'
    },
    wipeData: {
        position: 'absolute',
        top: 15,
        left: 15,
        padding: 10,
        backgroundColor: "#000000",
        borderRadius: 12
    },
    wipeDataText: {
        color: '#fff'
    },
    dropdownMenu: {
        backgroundColor: "rgba(25, 150, 175, 0.89)",
        width: 250,
    },
    dropdownContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
});

export default Settings;