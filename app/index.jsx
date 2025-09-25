import financeIcon from "@/assets/images/financeIcon.png";
import settingsIcon from "@/assets/images/settingsIcon.png";
import { useRouter } from "expo-router";
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fireStoreDB } from '../FirebaseConfig';
import { useAuth } from '../lib/AuthContext';

const HomePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [unpaidTransactions, setUnpaidTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('HomePage Auth state:', { authLoading, user });
    if (!authLoading && !user && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, authLoading, router.pathname]);

  // Fetch unpaid transactions
  useEffect(() => {
    if (authLoading || !user) {
      setTransactionLoading(true);
      return;
    }

    setTransactionLoading(true);
    const q = query(
      collection(fireStoreDB, `users/${user.uid}/transactions`),
      where('paid', '==', null || 'unpaid'),
      where('category', '==', 'expense')
    );

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, [user, authLoading]);

  // Function to mark a transaction as paid
  const markAsPaid = async (transactionId) => {
    try {
      const transactionRef = doc(fireStoreDB, `users/${user.uid}/transactions`, transactionId);
      await updateDoc(transactionRef, {
        paid: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error marking transaction as paid:', err);
      setError('Failed to mark transaction as paid');
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionText}>
          {item.subCategory}: ${item.amount.toFixed(2)}
        </Text>
        <Text style={styles.transactionSubText}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        {item.beneficiary && (
          <Text style={styles.transactionSubText}>
            To: {item.beneficiary}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.paidButton}
        onPress={() => markAsPaid(item.id)}
      >
        <Text style={styles.paidButtonText}>Mark as Paid</Text>
      </TouchableOpacity>
    </View>
  );

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
  }
});

export default HomePage;