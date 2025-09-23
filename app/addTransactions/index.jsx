import { addDoc, collection } from 'firebase/firestore';
import { useState } from "react";
import { Alert, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { fireStoreDB } from '../../FirebaseConfig';

const addTransactions = () => {
    const db = fireStoreDB;
    const [amount, setAmount] = useState('');
    const [beneficiary, setBeneficiary] = useState('');

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Income', value: 'in' },
        { label: 'Expense', value: 'expense' },
        { label: 'Spending', value: 'spend' },
        { label: 'Giving', value: 'give' },
    ]);

    const [openPaid, setOpenPaid] = useState(false);
    const [valuePaid, setValuePaid] = useState(null);
    const [itemsPaid, setItemsPaid] = useState([
        { label: 'Paid', value: 'paid' },
        { label: 'Unpaid', value: 'unpaid' },
    ]);

    const [openCurrentlyPaid, setOpenCurrentlyPaid] = useState(false);
    const [openCurrently, setOpenCurrently] = useState(false);
    const [giving, setGiving] = useState(false);
    const [paid, setPaid] = useState(false);

    const fadeAnim = new Animated.Value(0);

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
        setGiving(value === 'give');
        setPaid(value === 'expense');
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleSaveTransaction = async () => {
        if (!amount.trim()) {
            Alert.alert('Error', 'Please enter and amount');
            return;
        }

        try {

            let arrayData;

            if (giving) {
                arrayData = [
                    { category: value },
                    { amount: amount },
                    { timestamp: new Date().toISOString() }
                ];
            } else {
                arrayData = [
                    { category: value },
                    { amount: amount },
                    { timestamp: new Date().toISOString() }
                ];
            }

            const docRef = await addDoc(collection(db, 'users'), {
                arrayData
            });

            setValue(null);
            setAmount('');
            setBeneficiary('');
            Alert.alert('Success', 'Transaction saved!');
        } catch (error) {
            console.error('Error saving transaction:', error);
            Alert.alert('Error', 'Failed to save transaction');
        }
    };

    const onChangeValue = (newValue) => {
        setValue(newValue);
        setGiving(newValue === 'give');
        setPaid(newValue === 'expense');
    };

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
                placeholder="Amount"
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