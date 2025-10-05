import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Alert, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { fireStoreDB } from '../../FirebaseConfig';
import { useAuth } from '../../lib/AuthContext';

const addTransactions = () => {
    const db = fireStoreDB;
    const { user, loading } = useAuth();
    const [amount, setAmount] = useState('');
    const [beneficiary, setBeneficiary] = useState('');

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Income', value: 'in' },
        { label: 'Expense', value: 'expense' },
    ]);

    const [openType, setOpenType] = useState(false);
    const [valueType, setValueType] = useState(null);
    const [itemsType, setItemsType] = useState([
        { label: 'Living', value: 'Living' },
        { label: 'Bills', value: 'Bill' },
        { label: 'Personal', value: 'Personal' },
        { label: 'Giving', value: 'Gifting' },
    ]);

    const [openPaid, setOpenPaid] = useState(false);
    const [valuePaid, setValuePaid] = useState(null);
    const [itemsPaid, setItemsPaid] = useState([
        { label: 'Paid', value: 'paid' },
        { label: 'Unpaid', value: 'unpaid' },
    ]);

    const [openCurrentlyPaid, setOpenCurrentlyPaid] = useState(false);
    const [openCurrently, setOpenCurrently] = useState(false);
    const [openCurrentlyType, setOpenCurrentlyType] = useState(false);
    const [giving, setGiving] = useState(false);
    const [paid, setPaid] = useState(false);
    const [expense, setExpense] = useState(false);

    const fadeAnim = new Animated.Value(0);
    const [currency, setCurrency] = useState(null);

    const getCurrency = async () => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);
            const docSnap = await getDoc(totalRef);

            if (docSnap.exists()) {
                setCurrency(docSnap.data().Currency);
            }

        } catch (err) {
            console.error('Failed to update currency:', err);
            setError('Failed to update currency');
        }
    };

    const onOpenPaid = () => {
        setOpenCurrentlyPaid(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onClosePaid = () => {
        setOpenCurrentlyPaid(false);
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

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
        setPaid(value === 'expense');
        setExpense(value === 'expense');
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onOpenType = () => {
        setOpenCurrentlyType(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const onCloseType = () => {
        setOpenCurrentlyType(false);
        setGiving(valueType === 'Gifting');
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const updateTotal = async (value) => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);
            const docSnap = await getDoc(totalRef);

            let currentTotal = 0;

            if (docSnap.exists()) {
                currentTotal = parseFloat(docSnap.data().Total);
            }

            const newTotal = currentTotal + parseFloat(value);
            await updateDoc(totalRef, {
                Total: newTotal,
            });

        } catch (err) {
            console.error('Failed to update total:', err);
            setError('Failed to update total');
        }
    };

    const updateGiving = async (value, other) => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);
            const docSnap = await getDoc(totalRef);

            let currentTotal = 0;

            if (docSnap.exists()) {
                currentTotal = parseFloat(docSnap.data().GivingTotal);
            }

            let newTotal;
            if (other == 'True') {
                newTotal = currentTotal + (parseFloat(value) * 0.1);
            } else {
                newTotal = currentTotal + (parseFloat(value));
            }

            await updateDoc(totalRef, {
                GivingTotal: newTotal,
            });

        } catch (err) {
            console.error('Failed to update total:', err);
            setError('Failed to update total');
        }
    };

    const handleSaveTransaction = async () => {
        if (!amount.trim()) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'No user logged in. Please log in first.');
            return;
        }

        try {
            let transactionData;

            if (giving) {
                transactionData = {
                    category: value,
                    subCategory: valueType,
                    amount: parseFloat(amount),
                    beneficiary: beneficiary || null,
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                };
                updateTotal(-amount)
                updateGiving(-amount, 'False')
            } else {
                transactionData = {
                    category: value,
                    subCategory: valueType,
                    amount: parseFloat(amount),
                    timestamp: new Date().toISOString(),
                    paid: valuePaid || null,
                    userId: user.uid,
                };

                if (value === 'in') {
                    updateTotal(amount)
                    updateGiving(amount, 'True')
                } else if (valuePaid === 'paid') {
                    updateTotal(-amount)
                }
            }

            const docRef = await addDoc(collection(db, `users/${user.uid}/transactions`), transactionData);

            console.log('Transaction saved with ID:', docRef.id);
            setValue(null);
            setValuePaid(null);
            setAmount('');
            setBeneficiary('');
            Alert.alert('Success', 'Transaction saved!');
        } catch (error) {
            console.error('Error saving transaction:', error);
            Alert.alert('Error', 'Failed to save transaction: ' + error.message);
        }
    };

    const onChangeValue = (newValue) => {
        setValue(newValue);
        setExpense(newValue === 'expense');
        setPaid(newValue === 'expense');
    };

    const onChangeValueType = (newValue) => {
        setGiving(newValue === 'Gifting');
        setPaid(newValue !== 'Gifting');
    };

    useEffect(() => {
        getCurrency();
    });

    if (loading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
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

            <TextInput
                style={styles.testInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType='numeric'
                placeholder={"Amount " + { currency }}
            />

            <TextInput
                style={[styles.testInput, { display: giving ? 'flex' : 'none' }]}
                value={beneficiary}
                onChangeText={setBeneficiary}
                placeholder="Beneficiary"
            />

            <View
                style={[styles.dropdownContainer, { display: paid ? 'flex' : 'none' }]}
            >
                <DropDownPicker
                    style={[
                        styles.dropdown,
                        { backgroundColor: openCurrentlyPaid ? 'rgba(25, 150, 175, 0.89)' : 'rgba(255, 255, 255, 0.89)' }
                    ]}
                    dropDownContainerStyle={styles.dropdownMenu}
                    animationStyle={{ opacity: fadeAnim }}
                    open={openPaid}
                    value={valuePaid}
                    items={itemsPaid}
                    setOpen={setOpenPaid}
                    setValue={setValuePaid}
                    setItems={setItemsPaid}
                    placeholder="Select an item"
                    onOpen={onOpenPaid}
                    onClose={onClosePaid}
                />
            </View>

            <View
                style={[styles.dropdownContainer, { display: expense ? 'flex' : 'none' }]}
            >
                <DropDownPicker
                    style={[
                        styles.dropdown,
                        { backgroundColor: openCurrentlyType ? 'rgba(25, 150, 175, 0.89)' : 'rgba(255, 255, 255, 0.89)' }
                    ]}
                    dropDownContainerStyle={styles.dropdownMenu}
                    animationStyle={{ opacity: fadeAnim }}
                    open={openType}
                    value={valueType}
                    items={itemsType}
                    setOpen={setOpenType}
                    setValue={setValueType}
                    setItems={setItemsType}
                    placeholder="Select an item"
                    onChangeValue={onChangeValueType}
                    onOpen={onOpenType}
                    onClose={onCloseType}
                />
            </View>


            <TouchableOpacity
                style={styles.enterButton}
                onPress={handleSaveTransaction}>
                <Text style={styles.enterText}>Enter transaction</Text>
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
        backgroundColor: '#fff',
    },
    testInput: {
        width: 250,
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#000000ff',
        fontSize: 16,
        fontWeight: 500,
        color: '#333',
        marginBottom: 20,
    },
    enterButton: {
        width: 160,
        height: 60,
        backgroundColor: '#4F99B3',
        padding: 20,
        borderRadius: 20,
        justifyContent: 'center',
    },
    enterText: {
        fontSize: 16,
        fontWeight: 500,
        color: '#fff',
        textAlign: 'center',
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
    dropdownContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    dropdownMenu: {
        backgroundColor: "rgba(25, 150, 175, 0.89)",
        width: 250,
    }
});

export default addTransactions;