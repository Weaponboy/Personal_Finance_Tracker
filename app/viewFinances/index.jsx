import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { fireStoreDB } from '../../FirebaseConfig';
import { useAuth } from '../../lib/AuthContext';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
};

const ViewFinances = () => {

    const { user, loading } = useAuth();
    const [total, setTotal] = useState();
    const [givingAmount, setGivingAmount] = useState();
    const [incomeMonth, setIncome] = useState();

    const [chartData, setChartData] = useState([
        {
            name: 'Living',
            population: 0,
            color: '#4e5154ff',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
        {
            name: 'Personal',
            population: 0,
            color: '#4682B4',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
        {
            name: 'Giving',
            population: 0,
            color: '#4ca8eeff',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
        {
            name: 'Bills',
            population: 0,
            color: '#8dc2eaff',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
    ]);

    const getData = async () => {
        try {
            let livingValue = 0;
            let givingValue = 0;
            let billsValue = 0;
            let personalValue = 0;

            const usersRef = collection(fireStoreDB, `users/${user.uid}/transactions`);

            // Calculate date range for the last 30 days
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const livingQuery = query(
                usersRef,
                where('subCategory', '==', 'Living'),
                where('timestamp', '>=', thirtyDaysAgo.toISOString()),
                where('timestamp', '<=', now.toISOString())
            );
            const givingQuery = query(
                usersRef,
                where('subCategory', '==', 'Gifting'),
                where('timestamp', '>=', thirtyDaysAgo.toISOString()),
                where('timestamp', '<=', now.toISOString())
            );
            const billsQuery = query(
                usersRef,
                where('subCategory', '==', 'Bills'),
                where('timestamp', '>=', thirtyDaysAgo.toISOString()),
                where('timestamp', '<=', now.toISOString())
            );

            const personalQuery = query(
                usersRef,
                where('subCategory', '==', 'Personal'),
                where('timestamp', '>=', thirtyDaysAgo.toISOString()),
                where('timestamp', '<=', now.toISOString())
            );

            const [livingQueryEx, givingQueryEx, billsQueryEx, personalQueryEx] = await Promise.all([
                getDocs(livingQuery),
                getDocs(givingQuery),
                getDocs(billsQuery),
                getDocs(personalQuery),
            ]);

            livingQueryEx.forEach((doc) => {
                const data = doc.data();
                if (data.amount !== undefined) {
                    livingValue += Number(data.amount);
                }
            });

            givingQueryEx.forEach((doc) => {
                const data = doc.data();
                if (data.amount !== undefined) {
                    givingValue += Number(data.amount);
                }
            });

            billsQueryEx.forEach((doc) => {
                const data = doc.data();
                if (data.amount !== undefined) {
                    billsValue += Number(data.amount);
                }
            });

            personalQueryEx.forEach((doc) => {
                const data = doc.data();
                if (data.amount !== undefined) {
                    personalValue += Number(data.amount);
                }
            });

            setChartData([
                {
                    name: 'Living',
                    population: livingValue,
                    color: '#2b5681ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
                {
                    name: 'Personal',
                    population: personalValue,
                    color: '#5482a9ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
                {
                    name: 'Giving',
                    population: givingValue,
                    color: '#4ca8eeff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
                {
                    name: 'Bills',
                    population: billsValue,
                    color: '#80b9e4ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getIncome = async () => {
        try {
            setIncome(0);

            const usersRef = collection(fireStoreDB, `users/${user.uid}/transactions`);

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const incomeQuery = query(
                usersRef,
                where('category', '==', 'in'),
                where('timestamp', '>=', thirtyDaysAgo.toISOString()),
                where('timestamp', '<=', now.toISOString())
            );


            const [incomeQueryEx] = await Promise.all([
                getDocs(incomeQuery),
            ]);

            incomeQueryEx.forEach((doc) => {
                const data = doc.data();
                if (data.amount !== undefined) {
                    setIncome(incomeMonth + parseFloat(data.amount));
                }
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (loading || !user) {
            return;
        }

        const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);

        const initializeTotal = async () => {
            try {
                const docSnap = await getDoc(totalRef);
                if (!docSnap.exists()) {
                    await setDoc(totalRef, {
                        Total: 0,
                        GivingTotal: 0
                    });
                    console.log('Total document created for user:', user.uid);
                }
            } catch (err) {
                console.error('Failed to initialize total:', err);
                setError('Failed to initialize total');
            }
        };

        initializeTotal();

        const unsubscribe = onSnapshot(
            totalRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTotal(data.Total);
                    setGivingAmount(data.GivingTotal)
                } else {
                    setTotal(0);
                    setGivingAmount(0);
                }
            },
            (err) => {
                console.error('Failed to fetch total:', err);
                setError('Failed to fetch total');
            }
        );

        return () => unsubscribe();
    }, [user, loading]);

    const getTotal = async () => {
        try {
            const totalRef = doc(fireStoreDB, `users/${user.uid}/total`, user.uid);
            const docSnap = await getDoc(totalRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTotal(data.Total);
            } else {
                console.log('No such document!');
                setTotal(0);
            }
        } catch (err) {
            console.error('Failed to fetch total:', err);
            setError('Failed to fetch total');
        }
    };

    useEffect(() => {
        getData();
        getIncome();
        getTotal();
    }, []);

    return (
        <View style={styles.container}>

            <View style={styles.totalView}>
                <Text style={styles.totalHeading}>Total balance: </Text>
                <Text style={styles.totalHeading}>
                    {total}
                </Text>
            </View>

            <View style={styles.givingTotalView}>
                <Text style={styles.totalHeading}>Giving total: </Text>
                <Text style={styles.totalHeading}>
                    {givingAmount}
                </Text>
            </View>

            <View style={styles.incomeThisMonth}>
                <Text style={styles.totalHeading}>Income this month: </Text>
                <Text style={styles.totalHeading}>
                    {incomeMonth}
                </Text>
            </View>

            <View style={styles.PieChart}>
                <Text style={styles.heading}>Money out this month</Text>

                <PieChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                {/* <TouchableOpacity style={styles.refreshButton} onPress={getData}>
                    <Text>Refresh Data</Text>
                </TouchableOpacity> */}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 90,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 25,
        justifyContent: 'center',
        textAlign: 'center'
    },
    totalHeading: {
        fontSize: 20,
        fontWeight: 600,
        textAlign: 'center',
    },
    totalView: {
        textAlign: 'center',
        justifyContent: 'center',
        width: 190,
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#4F99B3',
        padding: 8,
        borderRadius: 12
    },
    givingTotalView: {
        textAlign: 'center',
        justifyContent: 'center',
        width: 190,
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: 20,
        left: 220,
        backgroundColor: '#4F99B3',
        padding: 8,
        borderRadius: 12
    },
    incomeThisMonth: {
        justifyContent: 'center',
        width: 390,
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: 75,
        left: 20,
        backgroundColor: '#657378ff',
        padding: 8,
        borderRadius: 12
    },
    PieChart: {
        position: 'absolute',
        top: 140,
        justifyContent: 'center',
        textAlign: 'center'
    }
});

export default ViewFinances;