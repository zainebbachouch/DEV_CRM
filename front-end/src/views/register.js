import React, { useState } from "react";
import axios from "axios";
import { GiConfirmed } from "react-icons/gi";

import style from "../style/viewsStyle/registerStyle.module.css";
import femaleAvatar from '../images/uploads/female_avatar.png';
import maleAvatar from '../images/uploads/male_avatar.png';

const emailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        telephone: "",
        adresse: "",
        dateDeNaissance: "",
        genre: "femme",
        typeUtilisateur: "employee",
    });

    const [touchedFields, setTouchedFields] = useState({
        nom: false,
        prenom: false,
        email: false,
        password: false,
        passwordConfirmation: false,
        telephone: false,
        adresse: false,
        dateDeNaissance: false,
    });

    const [errors, setErrors] = useState({
        nomError: "",
        prenomError: "",
        emailAddressError: "",
        passwordError: "",
        passwordConfirmationError: "",
        telephoneError: "",
        adresseError: "",
        dateDeNaissanceError: "",
        generalError: "",
    });

    const handleFocus = (fieldName) => {
        setTouchedFields({ ...touchedFields, [fieldName]: true });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const validationErrors = validateForm({ ...formData, [name]: e.target.value });
        setErrors({ ...errors, ...validationErrors });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value
        });

        setTouchedFields({ ...touchedFields, [name]: true });
        if (name === 'genre') {
            if (value === 'femme') {
                // Set photo based on gender
                const formData1 = new FormData();
                formData1.append('file', femaleAvatar);
                formData1.append('upload_preset', 'xlcnkdgy');
                axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1)
                    .then(response => {
                        setFormData((prev) => ({ ...prev, photo: response.data.secure_url }));
                    })
                    .catch(error => { console.log(error) });
            } else {
                // Set photo based on gender
                const formData1 = new FormData();
                formData1.append('file', maleAvatar);
                formData1.append('upload_preset', 'xlcnkdgy');
                axios.post('https://api.cloudinary.com/v1_1/dik98v16k/image/upload/', formData1)
                    .then(response => {
                        setFormData((prev) => ({ ...prev, photo: response.data.secure_url }));
                    })
                    .catch(error => { console.log(error) });
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [`${name}Error`]: "",
            generalError: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouchedFields({
            nom: true,
            prenom: true,
            email: true,
            password: true,
            passwordConfirmation: true,
            telephone: true,
            adresse: true,
            dateDeNaissance: true,
        });

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length === 0) {
            const photo = formData.photo;
            const dataToSend = { ...formData, photo: photo };
            try {
                const response = await axios.post("http://127.0.0.1:4000/api/registerUser", dataToSend);
                console.log("Response from server:", response.data);
            } catch (err) {
                console.error("Error object:", err);
                if (err.response) {
                    setErrors({ ...errors, generalError: err.response.data });
                } else {
                    setErrors({ ...errors, generalError: "An error occurred. Please try again later." });
                }
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const validateForm = (data) => {
        let errors = {};

        if (!data.nom.trim()) errors.nomError = "Le nom est requis";

        if (touchedFields.prenom && !data.prenom.trim()) errors.prenomError = "Le prénom est requis";

        if (touchedFields.email) {
            const email = data.email.trim();
            if (!email) {
                errors.emailAddressError = "L'adresse e-mail est requise";
            } else if (!emailValidator.test(email)) {
                errors.emailAddressError = "L'adresse e-mail n'est pas valide";
            }
        }

        if (touchedFields.password && !data.password.trim()) {
            errors.passwordError = "Le mot de passe est requis";
        } else if (touchedFields.password && !passwordValidator.test(data.password)) {
            errors.passwordError = "Le mot de passe doit contenir au moins 8 caractères, 1 chiffre, 1 majuscule et 1 minuscule";
        }

        if (touchedFields.passwordConfirmation && data.password !== data.passwordConfirmation) {
            errors.passwordConfirmationError = "Les mots de passe ne correspondent pas";
        }

        if (touchedFields.telephone && !data.telephone.trim()) errors.telephoneError = "Le numéro de téléphone est requis";
        if (touchedFields.adresse && !data.adresse.trim()) errors.adresseError = "L'adresse est requise";
        if (touchedFields.dateDeNaissance && !data.dateDeNaissance) errors.dateDeNaissanceError = "La date de naissance est requise";

        return errors;
    };

    return (
        <div className={style.registerContainer}>
            <div className={style.container }>
                <div className={style.bgImage + "" }></div>
                <div className={style.card + " d-flex align-items-center"}>
                    <div className="card-body ">
                        <h2 className="card-title text-center mb-3">Registration</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                               <div className="form-group col-md-6">
                                <label htmlFor="nom">Nom</label>
                                <input
                                    type="text"
                                    className={`${style.formControl} ${errors.nomError && touchedFields.nom ? style.invalid : ""}`}
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("nom")}
                                />
                                {errors.nomError && touchedFields.nom && <div className={style.errorMsg}>{errors.nomError}</div>}
                            </div>

                            <div className="form-group col-md-6">
                                <label htmlFor="prenom">Prénom</label>
                                <input
                                    type="text"
                                    className={`${style.formControl} ${errors.prenomError && touchedFields.prenom ? style.invalid : ""}`}
                                    id="prenom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("prenom")}
                                />
                                {errors.prenomError && touchedFields.prenom && <div className={style.errorMsg}>{errors.prenomError}</div>}
                            </div> 
                            </div>
                            
                        <div className="row">
<div className="form-group col-md-6">
                                <label htmlFor="email">Adresse e-mail</label>
                                <input
                                    type="email"
                                    className={`${style.formControl} ${errors.emailAddressError && touchedFields.email ? style.invalid : ""}`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("email")}
                                />
                                {errors.emailAddressError && touchedFields.email && <div className={style.errorMsg}>{errors.emailAddressError}</div>}
                            </div>

                            <div className="form-group col-md-6">
                                <label htmlFor="password">Mot de passe</label>
                                <input
                                    type="password"
                                    className={`${style.formControl} ${errors.passwordError && touchedFields.password ? style.invalid : ""}`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("password")}
                                />
                                {errors.passwordError && touchedFields.password && <div className={style.errorMsg}>{errors.passwordError}</div>}
                            </div>
                        </div>
                            
                        <div className="row">   
                        <div className="form-group col-md-6">
                                <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    className={`${style.formControl} ${errors.passwordConfirmationError && touchedFields.passwordConfirmation ? style.invalid : ""}`}
                                    id="passwordConfirmation"
                                    name="passwordConfirmation"
                                    value={formData.passwordConfirmation}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("passwordConfirmation")}
                                />
                                {errors.passwordConfirmationError && touchedFields.passwordConfirmation && <div className={style.errorMsg}>{errors.passwordConfirmationError}</div>}
                            </div>

                            <div className="form-group col-md-6">
                                <label htmlFor="telephone">Téléphone</label>
                                <input
                                    type="tel"
                                    className={`${style.formControl} ${errors.telephoneError && touchedFields.telephone ? style.invalid : ""}`}
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => handleFocus("telephone")}
                                />
                                {errors.telephoneError && touchedFields.telephone && <div className={style.errorMsg}>{errors.telephoneError}</div>}
                            </div>
                        </div>

                        <div className="row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="adresse">Adresse</label>
                                        <input
                                            type="text"
                                            className={`${style.formControl} ${errors.adresseError && touchedFields.adresse ? style.invalid : ""}`}
                                            id="adresse"
                                            name="adresse"
                                            value={formData.adresse}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            onFocus={() => handleFocus("adresse")}
                                        />
                                        {errors.adresseError && touchedFields.adresse && <div className={style.errorMsg}>{errors.adresseError}</div>}
                                    </div>

                                    <div className="form-group  col-md-6">
                                        <label htmlFor="dateDeNaissance">Date de naissance</label>
                                        <input
                                            type="date"
                                            className={`${style.formControl} ${errors.dateDeNaissanceError && touchedFields.dateDeNaissance ? style.invalid : ""}`}
                                            id="dateDeNaissance"
                                            name="dateDeNaissance"
                                            value={formData.dateDeNaissance}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            onFocus={() => handleFocus("dateDeNaissance")}
                                        />
                                        {errors.dateDeNaissanceError && touchedFields.dateDeNaissance && <div className={style.errorMsg}>{errors.dateDeNaissanceError}</div>}
                                    </div>
                        </div>

                        <div className="row">
                        <div className="form-group col-md-6">
                                <label htmlFor="genre">Genre</label>
                                <select
                                    className={style.formControl}
                                    id="genre"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus("genre")}
                                >
                                    <option value="femme">Femme</option>
                                    <option value="homme">Homme</option>
                                </select>
                            </div>

                            <div className="form-group col-md-6">
                                <label htmlFor="typeUtilisateur">Type d'utilisateur</label>
                                <select
                                    className={style.formControl}
                                    id="typeUtilisateur"
                                    name="typeUtilisateur"
                                    value={formData.typeUtilisateur}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus("typeUtilisateur")}
                                >
                                    <option value="employee">Employé</option>
                                    <option value="client">Client</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                           <div className="row d-flex justify-content-center">
                           {errors.generalError && <div className={style.errorMsg}>{errors.generalError}</div>}
                            <button type="submit" className={style.submitButton }><GiConfirmed className="  mx-2"></GiConfirmed> S'inscrire</button> 
                            </div> 

                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
