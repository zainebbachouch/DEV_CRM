import React from 'react';
import { BrowserRouter as Router, Route, Routes   } from "react-router-dom";
import Dashbord from './views/dashboard/Dashbord';
import Products from './views/product/Products';
import Calendar from './views/Calendar/Calendar';
import ProductDetails from './views/product/ProductDetails';
import Commands from './views/commands/Commands';
import Invoices from './views/invoices/invoices';
import Categories from './views/categorie/Categories';
import Login from './views/login';
import Register from './views/register';
import Home from './views/home/Home';
import { AuthProvider } from './views/context/authContext';
import GetCartProducts from './components/sidenav/getCartProducts';
import CompleteCommand from './components/sidenav/completeCommand';
import CommandDetails from './views/commands/CommandDetails';
import InvoicesDetails from './views/invoices/InvoicesDetails';
import Adminstration from './views/adminstration/adminstration';
import AuthorizationList from './views/authorization/AuthorizationList';
import UserPermissionsPage from './views/context/UserPermissionsPage';
import Profile from './components/sidenav/profile';
import Pageemployes from './views/adminstration/Pageemployes';
import Pageclients from './views/adminstration/Pageclients';
import { EnvoyeeMailClient, EnvoyeeMailEmploye } from './views/adminstration/EnvoyeeMail';
import MakeCall from './views/adminstration/MakeCall';
import Historique from './views/adminstration/Historique';
import MessengerPage from './views/messenger/MessengerPage';
import { NotificationProvider } from './views/context/NotificationContext';
import Task from './views/task/Task';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword ';
import Historyy from './components/sidenav/history';
import SpamMessages from './views/messenger/SpamMesages';





function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <UserPermissionsPage>
            <NotificationProvider>
              <Routes>
                <Route path="/">
                  <Route index element={<Home />} />
                  <Route path="login">
                    <Route index element={<Login />} />
                  </Route>
                  <Route path="password">
                    <Route index element={<ForgotPassword />} />
                  </Route>
                  <Route path="/reset-password">
                    <Route index element={<ResetPassword />} />
                  </Route>
                  <Route path="register">
                    <Route index element={<Register />} />
                  </Route>
                  <Route path="Dashboard">
                    <Route index element={<Dashbord />} />
                  </Route>
                  <Route path="Products">
                    <Route index element={<Products />} />
                    <Route path=":id" element={<ProductDetails />} />
                  </Route>
                  <Route path="Products">
                    <Route index element={<Products />} />
                  </Route>
                  <Route path="Commands">
                    <Route index element={<Commands />} />
                    <Route path=":id" element={<CommandDetails />} />
                  </Route>

                  <Route path="invoices" >
                    <Route index element={<Invoices />} />
                    <Route path=":id" element={<InvoicesDetails />} />
                  </Route>

                  <Route path="Categories">
                    <Route index element={<Categories />} />
                  </Route>
                  
                  <Route path="authorization">
                    <Route index element={<AuthorizationList />} />
                  </Route>
                  <Route path="cart">
                    <Route index element={<GetCartProducts />} />
                  </Route>
                  <Route path="completeCommand">
                    <Route index element={<CompleteCommand />} />
                  </Route>
                  <Route path="profile">
                    <Route path=":id" element={<Profile />} />
                  </Route>
                  <Route path="history">
                    <Route path=":id" element={<Historyy/>} />
                  </Route>

                  <Route path="messenger">
                    <Route index element={<MessengerPage />} />
                    <Route path=":messageId" element={<SpamMessages/>} />

                  </Route>


                  <Route path="task">
                    <Route index element={<Task />} />
                  </Route>
                  <Route path="adminstration">
                    <Route index element={<Adminstration />} />
                  </Route>

                  <Route path="Pageemployes/:id" element={<Pageemployes />}>
                    <Route path="envoyeeMail/:email" element={<EnvoyeeMailEmploye />} />
                    <Route path="makecall" element={<MakeCall />} />
                    <Route path="historique" element={<Historique type="employe" />} />
                  </Route>

                  <Route path="calendar" element={<Calendar />}></Route>


                  <Route path="Pageclients/:id" element={<Pageclients />} >
                    <Route path="envoyeeMail/:email" element={<EnvoyeeMailClient />} />
                    <Route path="makecall" element={<MakeCall />} />
                    <Route path="historique" element={<Historique type="client" />} />
                  </Route>

                </Route>
              </Routes>
            </NotificationProvider>
          </UserPermissionsPage>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
