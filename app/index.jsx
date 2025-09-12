import financeIcon from "@/assets/images/financeIcon.png";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomePage = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Image
        onPress={() => router.push('/settings')}
        style={styles.title}
      />

      <Image source={financeIcon} style={styles.iconImage} />
      <Text style={styles.title}>Welcome to your personal budgeting tool</Text>

      <TouchableOpacity
        style={styles.enterButton}
        onPress={() => router.push('/addTransactions')}>
        <Text style={styles.enterText}>Enter transactions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton}
        onPress={() => router.push('/viewFinances')}>
        <Text style={styles.viewText}>View finances</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 90,
    backgroundColor: '#fff'
  },
  iconImage: {
    paddingBottom: 40,
    height: 80,
    width: 80,
  },
  title: {
    paddingTop: 20
  },
  viewButton: {
    width: 160,
    height: 60,
    backgroundColor: '#4F99B3',
    padding: 20,
    marginTop: 20,
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  viewText: {
    textAlign: 'center'
  },
  enterButton: {
    width: 160,
    height: 60,
    backgroundColor: '#4F99B3',
    padding: 20,
    marginTop: 20,
    textAlign: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  enterText: {
    textAlign: 'center'
  }
});

export default HomePage;
