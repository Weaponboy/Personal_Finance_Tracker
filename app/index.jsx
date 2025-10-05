import financeIcon from "@/assets/images/financeIcon.png";
import settingsIcon from "@/assets/images/settingsIcon.png";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { fireStoreDB } from '../FirebaseConfig';
import { useAuth } from '../lib/AuthContext';

const HomePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [partialPayments, setPartialPayments] = useState({});
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');

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

  useEffect(() => {
    console.log('HomePage Auth state:', { authLoading, user });
    if (!authLoading && !user && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, authLoading, router.pathname]);

  useEffect(() => {
    if (authLoading || !user) {
      setTransactionLoading(true);
      return;
    }

    getCurrency();
    setTransactionLoading(true);

    const q = query(
      collection(fireStoreDB, `users/${user.uid}/transactions`),
      where('paid', '==', null || 'unpaid'),
      where('category', '==', 'expense')
    );

    const unsubscribeTransactions = onSnapshot(
      q,
      (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
        setUnpaidTransactions(transactions);
        setTransactionLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        setTransactionLoading(false);
      }
    );

    const partialQ = collection(fireStoreDB, `users/${user.uid}/partiallyPaidTransactions`);
    const unsubscribePartials = onSnapshot(
      partialQ,
      (querySnapshot) => {
        const partials = {};
        querySnapshot.forEach((doc) => {
          partials[doc.id] = doc.data().paidAmount;
        });
        setPartialPayments(partials);
      },
      (err) => {
        console.error('Error fetching partial payments:', err);
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribePartials();
      getCurrency();
    };
  }, [user, authLoading]);

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

  const markAsPaid = async (transactionId) => {
    try {
      const transactionRef = doc(fireStoreDB, `users/${user.uid}/transactions`, transactionId);
      const docSnap = await getDoc(transactionRef);
      const data = docSnap.data();

      const paid = partialPayments[transactionId] || 0;
      const remaining = data.amount - paid;
      updateTotal(-remaining);

      await updateDoc(transactionRef, {
        paid: 'paid',
      });

      // Delete partial if exists
      const partialRef = doc(fireStoreDB, `users/${user.uid}/partiallyPaidTransactions`, transactionId);
      const partialSnap = await getDoc(partialRef);
      if (partialSnap.exists()) {
        await deleteDoc(partialRef);
      }
    } catch (err) {
      console.error('Error marking transaction as paid:', err);
      setError('Failed to mark transaction as paid');
    }
  };

  const handleSavePartial = async () => {
    if (!partialAmount || isNaN(partialAmount)) return;
    const amount = parseFloat(partialAmount);
    if (amount <= 0) return;

    try {
      const partialRef = doc(fireStoreDB, `users/${user.uid}/partiallyPaidTransactions`, selectedTransaction.id);
      const docSnap = await getDoc(partialRef);
      let currentPaid = 0;
      if (docSnap.exists()) {
        currentPaid = docSnap.data().paidAmount;
      }
      const newPaid = currentPaid + amount;

      await setDoc(partialRef, { paidAmount: newPaid }, { merge: true });

      updateTotal(-amount);

      if (newPaid >= selectedTransaction.amount) {
        const transRef = doc(fireStoreDB, `users/${user.uid}/transactions`, selectedTransaction.id);
        await updateDoc(transRef, { paid: 'paid' });
        await deleteDoc(partialRef);
      }

      setShowModal(false);
      setPartialAmount('');
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error saving partial payment:', err);
      setError('Failed to save partial payment');
    }
  };

  const renderTransaction = ({ item }) => {
    const paid = partialPayments[item.id] || 0;
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => {
          setSelectedTransaction(item);
          setShowModal(true);
        }}
      >
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionText}>
            {item.subCategory}: {currency}{item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionSubText}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          {item.beneficiary && (
            <Text style={styles.transactionSubText}>
              To: {item.beneficiary}
            </Text>
          )}
          {paid > 0 && (
            <Text style={styles.transactionSubText}>
              Paid: {currency}{paid.toFixed(2)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.paidButton}
          onPress={() => markAsPaid(item.id)}
        >
          <Text style={styles.paidButtonText}>Mark as Paid</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    getCurrency();
  });

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingBar}>
        <Image source={financeIcon} style={styles.iconImage} />
        <View style={styles.buttonAndHeading}>
          <Text style={styles.title}>Welcome to your personal budgeting tool</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.enterButton}
              onPress={() => router.push('/addTransactions')}
            >
              <Text style={styles.enterText}>Enter transactions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push('/viewFinances')}
            >
              <Text style={styles.viewText}>View finances</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.pendingTransactions}>
        <Text style={styles.header}>Pending Transactions</Text>
        {transactionLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : unpaidTransactions.length === 0 ? (
          <Text style={styles.emptyText}>No unpaid transactions</Text>
        ) : (
          <FlatList
            data={unpaidTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            style={styles.transactionList}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.clickSettings}
        onPress={() => router.push('/settings')}
      >
        <Image source={settingsIcon} style={styles.settingsIcon} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter Partial Payment Amount</Text>
            <TextInput
              style={styles.input}
              value={partialAmount}
              onChangeText={setPartialAmount}
              keyboardType="numeric"
              placeholder="Amount paid"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSavePartial}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowModal(false);
                  setPartialAmount('');
                  setSelectedTransaction(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 90,
    backgroundColor: '#fff',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
  },
  headingBar: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 20,
  },
  iconImage: {
    height: 80,
    width: 80,
  },
  buttonAndHeading: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 15,
    marginLeft: 6,
  },
  viewButton: {
    width: 130,
    height: 60,
    backgroundColor: '#4F99B3',
    padding: 5,
    marginTop: 10,
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  viewText: {
    textAlign: 'center',
    color: '#fff',
  },
  enterButton: {
    width: 140,
    height: 60,
    backgroundColor: '#4F99B3',
    padding: 5,
    marginLeft: 4,
    marginTop: 10,
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: 10,
  },
  enterText: {
    textAlign: 'center',
    color: '#fff',
  },
  settingsIcon: {
    height: 100,
    width: 100,
  },
  clickSettings: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  pendingTransactions: {
    height: 350,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: '90%',
    borderStyle: 'solid',
    borderColor: '#00000',
    borderWidth: 3,
    marginTop: 20
  },
  transactionList: {
    flexGrow: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#586b76ff',
    margin: 5,
    borderRadius: 6
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionSubText: {
    fontSize: 14,
    color: '#000000ff',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  paidButton: {
    backgroundColor: '#4F99B3',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  paidButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    fontSize: 20,
    fontStyle: 'bold',
    fontWeight: 600
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#4F99B3',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomePage;