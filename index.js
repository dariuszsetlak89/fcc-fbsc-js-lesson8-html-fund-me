import { ethers } from "./ethers-5.6.esm.min.js";
import { contractAddress, abi } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const connectLabel = document.getElementById("connectLabel");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const balanceLabel = document.getElementById("balanceLabel");
const withdrawButton = document.getElementById("withdrawButton");
const withdrawLabel = document.getElementById("withdrawLabel");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
        connectLabel.innerHTML = accounts;
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
        balanceLabel.innerHTML = `${ethers.utils.formatEther(balance)} ETH`;
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        // provider - connection to the blockchain
        // signer / wallet - someone with some gas
        // ABI & Contract address - contract that we are interacting with
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // Listen amd wait for the tx to be mined
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    // Listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const balance = await provider.getBalance(contractAddress);

        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
            withdrawLabel.innerHTML = `Withdrawal completed! ${ethers.utils.formatEther(
                balance
            )} ETH`;
        } catch (error) {
            console.log("ERROR! Not Owner!!!");
            withdrawLabel.innerHTML = `ERROR! Not Owner!!!`;
        }
    }
}
