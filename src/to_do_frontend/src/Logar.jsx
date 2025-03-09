import { createActor, to_do_backend } from 'declarations/to_do_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";


let actorLoginBackend = to_do_backend;


export async function login() {
  try {
    // Criar o authClient
    let authClient = await AuthClient.create();

    // Inicia o processo de login e aguarda até que ele termine
    await authClient.login({
      // Redireciona para o provedor de identidade da ICP (Internet Identity)
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {   
        // Caso entrar neste bloco significa que a autenticação ocorreu com sucesso!
        const identity = authClient.getIdentity();
        console.log(identity.getPrincipal().toText()); // Já é possivel ter acesso ao Principal do usuário atenticado         
        
        /* A identidade do usuário autenticado poderá ser utilizada para criar um HttpAgent.
            Ele será posteriormente utilizado para criar o Actor (autenticado) correspondente ao Canister de Backend  */
        const agent = new HttpAgent({identity});
        /* O comando abaixo irá criar um Actor Actor (autenticado) correspondente ao Canister de Backend  
          desta forma, todas as chamadas realizadas a metodos SHARED no Backend irão receber o "Principal" do usuário */
        actorLoginBackend = createActor(process.env.CANISTER_ID_LOGIN_BACKEND, {
            agent,
        });
        
        const principalText = await actorLoginBackend.get_principal_client();          
        localStorage.setItem("isLoggedIn", "true");
        document.getElementById("principalText").innerText = principalText;     
        //O principal anônimo no Internet Computer é representado pelo valor textual "2vxsx-fae".
      },
      
      windowOpenerFeatures: `
                              left=${window.screen.width / 2 - 525 / 2},
                              top=${window.screen.height / 2 - 705 / 2},
                              toolbar=0,location=0,menubar=0,width=525,height=705
                            `,
    })
    return false;
  }
  catch (err) {
    console.error("Erro ao fazer login", err);
  }
    
};

async function logout() {
    const authClient = await AuthClient.create();        
    await authClient.logout();     
    document.getElementById("principalText").innerText = "";
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
};  

document.addEventListener("DOMContentLoaded", function() {    
    document.getElementById("logout").style.display = "none";
});