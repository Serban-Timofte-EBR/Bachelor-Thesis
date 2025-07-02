package models

type SignupReq struct {
	Clinic          string `json:"clinic"`
	ConfirmPassword string `json:"confirmPassword"`
	County          string `json:"county"`
	Email           string `json:"email"`
	IDDoctor        string `json:"idDoctor"`
	Locality        string `json:"locality"`
	Name            string `json:"name"`
	Password        string `json:"password"`
	Surname         string `json:"surname"`
	Role            int    `json:"role"`
}
