# **Cali Mafia – Mafia and Moderator Portal**

Welcome to the repository for the **Mafia and Moderator Portal** of *Cali Mafia*, built as part of the **Calimero x Starknet Hackathon**. This component handles private communication and game management through **Calimero Application** and the logic installed in the **node**. It ensures secure interactions for Mafia members and seamless control for moderators.

---

## **Overview**

This repository contains:  
1. **Calimero Application** logic that powers private contexts for secure communication and strategic planning.  
2. **Frontend (app directory)** for Mafia members and moderators to interact with the private Calimero node.  
3. **Compiled WebAssembly (logic/res)**, which is installed on the Calimero node.  
4. **Source code (logic/src)** for the logic that is compiled into WebAssembly (WASM).

With this system, *Cali Mafia* enables privacy-preserving gameplay where team-specific communication remains entirely secure.

---

## **Features**

### **Moderator Features**  
- **Role Assignment:** Moderators assign roles and commit them to the blockchain.  
- **Private Context Creation:** Moderators create private contexts for teams (e.g., Mafia members) and invite specific players.  
- **Game Management:** Tools to manage player actions, handle voting, and progress the game.  

### **Mafia Member Features**  
- **Private Communication:** Mafia members can strategize securely in private contexts, shielded from other players.  
- **Vote and Actions:** Participate in game actions like voting while maintaining privacy.  

### **Backend (Node Logic)**  
- **Secure Communication:** Logic in the `logic/src` directory is compiled to WASM and ensures private and encrypted communication within Calimero contexts.  
- **Team-Specific Contexts:** Automates the creation of private contexts and manages participant access based on roles.  
---

## **Tech Stack**

- **Frontend (app directory):**  
  - Built with modern web technologies (React.js).  
  - Integrates with Calimero private nodes for secure communication.
  - Syncs Game State with Starknet contract.

- **Backend (node logic):**  
  - Source code in `logic/src` written in Rust and compiled into WASM for use in the Calimero node.  
  - Logic installed in the Calimero node ensures secure private contexts for the game.  

---

## **Getting Started**

### **Prerequisites**  
1. **Node.js** (v22 or later).  
2. **pnpm**.  
3. **Rust** (for compiling the node logic).  
4. **Calimero Private Node** (setup required to run the application).  

---

### **Installation**

#### **Clone the Repository**  
```bash
git clone https://github.com/Demigod345/Cali-Mafia.git cali-mafia-portal
cd cali-mafia-portal
```

#### **Install Dependencies**  
```bash
# Using npm
pnpm install
```

---

### **Set Up Calimero Node**

1. **Compile the Node Logic to WASM:**  
   Navigate to the `logic/src` directory and compile the `lib.rs` file into WASM:  
   ```bash
   cd logic
   ./build.sh
   ```  
   The compiled WASM file will be generated in the `logic/res` directory.  

2. **Upload WASM Logic to Calimero Node:**  
   Use the Calimero admin interface or CLI to upload the compiled WASM file (`logic/res`).  

   ```bash
   application install file <PATH TO FILE>
   ```  

---

### **Run the Frontend Locally**

Navigate to the `app` directory and start the frontend:  
```bash
cd app
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to access the portal.

---

## **How It Works**

1. **Moderator Portal:**  
   - Moderators create a game and assign roles.  
   - Private contexts are automatically generated for the Mafia, allowing them to communicate securely.  
   - Game actions (e.g., voting) are coordinated through the portal and recorded on-chain via Starknet.

2. **Mafia Portal:**  
   - Mafia members access their private context to discuss strategies without fear of exposure.  
   - All communications are secured and encrypted within Calimero's private contexts.

3. **Node Logic:**  
   - The `logic/src/lib.rs` defines the logic for private contexts, communication, and synchronization with Starknet.  
   - This logic is compiled to WASM and installed in the Calimero node (`logic/res`).  

---

## **Folder Structure**

- **app/**: Frontend for the portal, enabling interaction with the Calimero node.  
- **logic/src/**: Source code (written in Rust) for the node logic, which is compiled into WASM.  
- **logic/res/**: Compiled WASM logic ready for installation on the Calimero node.  

---

## **Future Enhancements**

- Improved moderator tools for real-time game management.  
- Advanced analytics for player behavior and game outcomes.  
- Support for additional game modes using private contexts.  

---

## **Contributing**

We welcome contributions to improve *Cali Mafia*! To contribute:  
1. Fork the repository.  
2. Create a feature branch:  
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:  
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push your branch:  
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.  

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## **Contact**

For questions or feedback, feel free to reach out:  
- **Author:** Divyansh Jain  
- **Email:** [divyanshjain.2206@gmail.com](mailto:divyanshjain.2206@gmail.com)
