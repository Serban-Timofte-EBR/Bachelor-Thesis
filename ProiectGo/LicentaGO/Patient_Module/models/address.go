package models

type Address struct {
	Address  string   `json:"address"`
	Locality Locality `json:"loc"`
}

type Locality struct {
	Name string `json:"name"`
	Jud  Judet  `json:"jud"`
}

type Judet struct {
	Name string `json:"name"`
}
