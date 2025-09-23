import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { fireStoreDB } from '../../FirebaseConfig';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
};

const ViewFinances = () => {

    const [chartData, setChartData] = useState([
        {
            name: 'Expenses',
            population: 0,
            color: '#4e5154ff',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
        {
            name: 'Spending',
            population: 0,
            color: '#4682B4',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
        {
            name: 'Giving',
            population: 0,
            color: '#80b9e4ff',
            legendFontColor: '#333',
            legendFontSize: 15,
        },
    ]);

    const getData = async () => {
        try {
            let expensesValue = 0;
            let givingValue = 0;
            let spendingValue = 0;

            const usersRef = collection(fireStoreDB, 'transactions');

            const expenseQuery = query(usersRef, where('arrayData', 'array-contains', { category: 'expense' }));
            const givingQuery = query(usersRef, where('arrayData', 'array-contains', { category: 'give' }));
            const spendingQuery = query(usersRef, where('arrayData', 'array-contains', { category: 'spend' }));

            const [querySnapshotEx, querySnapshotGive, querySnapshotSpend] = await Promise.all([
                getDocs(expenseQuery),
                getDocs(givingQuery),
                getDocs(spendingQuery),
            ]);

            querySnapshotEx.forEach((doc) => {
                const data = doc.data();
                data.arrayData.forEach((item) => {
                    if (item.amount !== undefined) {
                        expensesValue += Number(item.amount);
                    }
                });
            });

            querySnapshotGive.forEach((doc) => {
                const data = doc.data();
                data.arrayData.forEach((item) => {
                    if (item.amount !== undefined) {
                        givingValue += Number(item.amount);
                    }
                });
            });

            querySnapshotSpend.forEach((doc) => {
                const data = doc.data();
                data.arrayData.forEach((item) => {
                    if (item.amount !== undefined) {
                        spendingValue += Number(item.amount);
                    }
                });
            });

            setChartData([
                {
                    name: 'Expenses',
                    population: expensesValue,
                    color: '#2b5681ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
                {
                    name: 'Spending',
                    population: spendingValue,
                    color: '#5482a9ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
                {
                    name: 'Giving',
                    population: givingValue,
                    color: '#80b9e4ff',
                    legendFontColor: '#333',
                    legendFontSize: 15,
                },
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <View style={styles.container}>

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

            <TouchableOpacity onPress={getData}>
                <Text>Refresh Data</Text>
            </TouchableOpacity>
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
        paddingBottom: 10
    }
});

export default ViewFinances;