"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const path_1 = __importDefault(require("path"));
const _1 = require("node-opcua-coreaas");
const CoreAAS_enums_1 = require("./CoreAAS_enums");

//Cliente Modbus
const modbus = require("jsmodbus");
const net = require('net');
const socket = new net.Socket();
var client = new modbus.client.TCP(socket);
const options = {
    'host': '192.168.1.3',
    'port': '502'
};
var datoEncendido;
var datoConteoPlaca;
var datoConteoAlimentador;
socket.on("connect", function() {
        setInterval(function () {
        client.readHoldingRegisters(260,1).then(function(resp) {
            datoEncendido = resp.response._body.values[0];
        }).catch(function() {
            console.error(arguments);            
            socket.end();
        });
        client.readHoldingRegisters(129,1).then(function(resp) {
            datoConteoPlaca = resp.response._body.values[0];
        }).catch(function() {
            console.error(arguments);            
            socket.end();
        });
        client.readHoldingRegisters(128,1).then(function(resp) {
            datoConteoAlimentador = resp.response._body.values[0];
        }).catch(function() {
            console.error(arguments);            
            socket.end();
        });
        }, 1000);
    });
socket.on("error", console.error);
socket.connect(options);
setInterval(function () { console.log(datoEncendido,datoConteoPlaca,datoConteoAlimentador)},1000);

//Servidor AAS
let xmlFiles = [_1.nodesets.standard, _1.coreaasXmlFile];

let server = new _1.CoreServer({
    nodeset_filename: xmlFiles,
    port: 4848,
    serverCertificateManager: new _1.OPCUACertificateManager({
        automaticallyAcceptUnknownCertificate: true,
        rootFolder: path_1.default.join(__dirname, "../certs")
    })
});

function post_initialize() {
    const Identifier = server.coreaas.Identifier;
    const Key = server.coreaas.Key;
/*     let admin = server.coreaas.addAdministrativeInformation({
        version: "555",
        revision: "1825"
    }); */
    const aas_1 = server.coreaas.addAssetAdministrationShell({
       browseName: "Atornillador UR3",
       description: [new _1.LocalizedText({ locale: "sp", text: "Cobot UR3 que realiza la operacion de atornillado sobre placa plana"})],
       identification: new Identifier({
            id: "http://cap.edu.co/CobotUR3",
            idType: _1.IdentifierType.IRI
        }),
        assetRef: [new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Asset,
                value: "https://www.universal-robots.com/es/productos/robot-ur3/"
            })],
            
/*             derivedFromRef: [new Key({
                idType: _1.KeyType.IRDI,
                local: false,
                type: _1.KeyElements.AssetAdministrationShell,
                value: "AAA#1234-454#123456789"
            })], */
            /* administration: admin */
    });
    
    let asset = server.coreaas.addAsset({
        
        browseName: "robot-ur3",
        idShort: "robot-ur3",
        identification: new Identifier({
            id: "https://www.universal-robots.com/es/productos/robot-ur3/",
            idType: _1.IdentifierType.IRI
        }),
        kind: CoreAAS_enums_1.AssetKind.Instance,
        description: "Cobot UR3 para realizar tareas de atornillado",
        
        assetIdentificationModelRef: [new Key({
                idType: _1.KeyType.IRI,
                local: false,
                type: _1.KeyElements.Submodel,
                value: "//submodels/identification_3S7PLFDRS35"
            })],
            
            billOfMaterialRef: [new Key({
                idType: _1.KeyType.IRI,
                local: false,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/sampleAAS_Composition"
            })]
    });
    
    aas_1.hasAsset(asset)
        .addSubmodelRef([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/12345679"
        })]);
        
/*     let dcMotorAsset = server.coreaas.addAsset({
        browseName: "dcMotor_123456789",
        idShort: "dcMotor_123456789",
        identification: new Identifier({
            id: "http://pk.festo.com/dcMotor_123456789",
            idType: _1.IdentifierType.IRI
        }),
        kind: CoreAAS_enums_1.AssetKind.Instance,
        description: "DC Motor of Festo Controller Asset"
    }); */
    
/*     const submodel_type = server.coreaas.addSubmodel({
        browseName: "AAAAA",
        kind: _1.ModelingKind.Template,
        idShort: "AAAA",
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/AAAA",
            idType: _1.IdentifierType.IRI
        })
    }); */

    const submodeloDatosTecnicos = server.coreaas.addSubmodel({
        browseName: "Datos_Tecnicos",
        kind: _1.ModelingKind.Instance,
        idShort: "Datos_Tecnicos",
        semanticId: [new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "http://admin-shell.io/ZVEI/TechnicalData/Submodel/1/1"
        })],
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/Datos_Tecnicos",
            idType: _1.IdentifierType.IRI
        })}).submodelOf(aas_1)
        .addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.AssetAdministrationShell,
            value: "http://cap.edu.co/CobotUR3"
        })]);

    let informacionGeneral = server.coreaas.addSubmodelElementCollection({
        idShort: "Informacion_General",
        submodelElementOf: submodeloDatosTecnicos,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Tecnicos"
        })]);

    const manufacturerPartNumber = server.coreaas.addSubmodelProperty({
        browseName: "ManufacturerPartNumber",
        idShort: "ManufacturerPartNumber",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.String,
        value: {
            dataType: "String",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.String, value: "2019330210" });
                }
            }
        }
    }).addSemanticId([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "https://adminshell.io/ZVEI/TechnicalData/ManufacturerPartNumber/1/1"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Tecnicos"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Informacion_General"
        })]);

    let propiedadesTecnicas= server.coreaas.addSubmodelElementCollection({
        idShort: "Propiedades_Tecnicas",
        submodelElementOf: submodeloDatosTecnicos,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Tecnicos"
        })]);

    const consumoEnergia = server.coreaas.addRange({
            browseName: "Consumo_Energia",
            idShort: "Consumo_Energia",
            valueType: _1.PropertyValueType.Double,
            min: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: 90 });
                    }
                }
            },
            max: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: 250 });
                    }
                }
            }
        }).addSemanticId([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "Pendiente"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Tecnicos"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Propiedades_Tecnicas"
        })]);

    const alcanceRobot = server.coreaas.addSubmodelProperty({
            browseName: "Alcance_Robot",
            idShort: "Alcance_Robot",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: "500" });
                    }
                }
            }
        }).addSemanticId([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.ConceptDescription,
                value: "Pendiente"
            })]).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Datos_Tecnicos"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Propiedades_Tecnicas"
            })]);    

    informacionGeneral.addElements([manufacturerPartNumber]);
    propiedadesTecnicas.addElements([consumoEnergia, alcanceRobot]);

    const submodeloPlacaFabricante = server.coreaas.addSubmodel({
        browseName: "Placa_Fabricante",
        kind: _1.ModelingKind.Instance,
        idShort: "Placa_Fabricante",
        semanticId: [new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "https://admin-shell.io/zvei/nameplate/1/0/Nameplate"
        })],
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/Placa_Fabricante",
            idType: _1.IdentifierType.IRI
        })}).submodelOf(aas_1)
        .addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.AssetAdministrationShell,
            value: "http://cap.edu.co/CobotUR3"
        })]);

    let informacionPlacaFabricante = server.coreaas.addSubmodelElementCollection({
        idShort: "Informacion_Placa_Fabricante",
        submodelElementOf: submodeloPlacaFabricante,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        })]);

    const manufacturerName = server.coreaas.addSubmodelProperty({
        browseName: "ManufacturerName",
        idShort: "ManufacturerName",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.String,
        value: {
            dataType: "String",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.String, value: "Universal Robots" });
                }
            }
        }
    }).addSemanticId([new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-AAO677#002"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Informacion_Placa_Fabricante"
        })]);

    const yearOfConstruction = server.coreaas.addSubmodelProperty({
        browseName: "YearOfConstruction",
        idShort: "YearOfConstruction",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.Double,
        value: {
            dataType: "Double",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.Double, value: 2019 });
                }
            }
        }
    }).addSemanticId([new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-AAP906#001"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Informacion_Placa_Fabricante"
        })]);

    let direccion = server.coreaas.addSubmodelElementCollection({
        idShort: "Direccion",
        submodelElementOf: submodeloPlacaFabricante,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        })]);

    const pais = server.coreaas.addSubmodelProperty({
        browseName: "Pais",
        idShort: "Pais",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.String,
        value: {
            dataType: "String",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.String, value: "Dinamarca" });
                }
            }
        }}).addSemanticId([new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-AAO133#002"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Direccion"
        })]);

   /*  const departamento = server.coreaas.addSubmodelProperty({
        browseName: "Departamento",
        idShort: "Departamento",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.String,
        value: {
            dataType: "String",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.String, value: "Valle del Cauca" });
                }
            }
        }
    }).addSemanticId([new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-AAO127#003"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Direccion"
        })]); */

    const ciudad = server.coreaas.addSubmodelProperty({
        browseName: "Ciudad",
        idShort: "Ciudad",
        category: _1.PropertyCategory.VARIABLE,
        valueType: _1.PropertyValueType.String,
        value: {
            dataType: "String",
            value: {
                get: () => {
                    return new _1.Variant({ dataType: _1.DataType.String, value: "Odense" });
                }
            }
        }}).addSemanticId([new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-AAO132#002"
        })]).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
        }),
        new Key({
            idType: _1.KeyType.idShort,
            local: true,
            type: _1.KeyElements.SubmodelElementCollection,
            value: "Direccion"
        })]);

        const calle = server.coreaas.addSubmodelProperty({
            browseName: "Calle",
            idShort: "Calle",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.String, value: "Energivej 25" });
                    }
                }
            }}).addSemanticId([new Key({
                idType: _1.KeyType.IRDI,
                local: true,
                type: _1.KeyElements.ConceptDescription,
                value: "0173-1#02-AAO128#002"
            })]).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Placa_Fabricante"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Direccion"
            })]);

    informacionPlacaFabricante.addElements([manufacturerName, yearOfConstruction]);
    direccion.addElements([pais, ciudad, calle]);

    const submodeloDocumentacion = server.coreaas.addSubmodel({
        browseName: "Documentacion",
        kind: _1.ModelingKind.Instance,
        idShort: "Documentacion",
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/Documentacion",
            idType: _1.IdentifierType.IRI
        })}).submodelOf(aas_1)
        .addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.AssetAdministrationShell,
            value: "http://cap.edu.co/CobotUR3"
        })]);

    let manuales = server.coreaas.addSubmodelElementCollection({
        idShort: "Manuales",
        submodelElementOf: submodeloDocumentacion,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Documentacion"
        })]);

    const manualUR3 = server.coreaas.addSubmodelProperty({
            browseName: "Manual_RobotUR3",
            idShort: "Manual_RobotUR3",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.String,
            value: {
                dataType: "String",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.String, value: "https://s3-eu-west-1.amazonaws.com/ur-support-site/77394/99351_UR3_User_Manual_es_E67ON_Global.pdf" });
                    }
                }
            }}).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Documentacion"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Manuales"
            })]);

    manuales.addElements([manualUR3]);

    const submodeloDatosOperacionales = server.coreaas.addSubmodel({
        browseName: "Datos_Operacionales",
        kind: _1.ModelingKind.Instance,
        idShort: "Datos_Operacionales",
        identification: new Identifier({
            id: "http://www.zvei.de/demo/submodel/Datos_Operacionales",
            idType: _1.IdentifierType.IRI
        })}).submodelOf(aas_1)
        .addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.AssetAdministrationShell,
            value: "http://cap.edu.co/CobotUR3"
        })]);

    let estadoRobot = server.coreaas.addSubmodelElementCollection({
        idShort: "Estado_Del_Robot",
        submodelElementOf: submodeloDatosOperacionales,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
        })]);

    const encendidoRobot = server.coreaas.addSubmodelProperty({
            browseName: "Robot_Encendido",
            idShort: "Robot_Encendido",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: datoEncendido });
                    }
                }
            }}).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Estado_Del_Robot"
            })]);

/*     const operacionRobot = server.coreaas.addSubmodelProperty({
            browseName: "Robot_En_Operacion",
            idShort: "Robot_En_Operacion",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: 0 });
                    }
                }
            }}).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Estado_Del_Robot"
            })]); */

    let conteoTornillos = server.coreaas.addSubmodelElementCollection({
        idShort: "Conteo_Tornillos",
        submodelElementOf: submodeloDatosOperacionales,
        ordered: true,
        kind: _1.ModelingKind.Instance

    }).addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
        })]);

    const conteoAlimentador = server.coreaas.addSubmodelProperty({
            browseName: "Tornillos_Disponibles_Alimentador",
            idShort: "Tornillos_Alimentador",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: datoConteoAlimentador});
                    }
                }
            }}).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Conteo_Tornillos"
            })]);

    const conteoPlaca = server.coreaas.addSubmodelProperty({
            browseName: "Tornillos_Atornillados_Placa",
            idShort: "Tornillos_Placa",
            category: _1.PropertyCategory.VARIABLE,
            valueType: _1.PropertyValueType.Double,
            value: {
                dataType: "Double",
                value: {
                    get: () => {
                        return new _1.Variant({ dataType: _1.DataType.Double, value: datoConteoPlaca });
                    }
                }
            }}).addParent([new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Submodel,
                value: "http://www.zvei.de/demo/submodel/Datos_Operacionales"
            }),
            new Key({
                idType: _1.KeyType.idShort,
                local: true,
                type: _1.KeyElements.SubmodelElementCollection,
                value: "Conteo_Tornillos"
            })]);

        estadoRobot.addElements([encendidoRobot]);
        conteoTornillos.addElements([conteoAlimentador, conteoPlaca]);



/*     let technicalProperties = server.coreaas.addSubmodelElementCollection({
        idShort: "Technical_Properties",
        submodelElementOf: submodel_1,
        ordered: false,
        kind: _1.ModelingKind.Instance
    })
        .addParent([new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.Submodel,
            value: "http://www.zvei.de/demo/submodel/Technical_Data"
        })]); */
    
/*     const component1 = server.coreaas.addEntity({
        browseName: "DC Motor",
        idShort: "dcMotor",
        entityType: CoreAAS_enums_1.EntityTypeEnumType.CoManagedEntity,
        asset: [new Key({
                idType: _1.KeyType.IRI,
                local: true,
                type: _1.KeyElements.Asset,
                value: "http://pk.festo.com/dcMotor_123456789"
            })],
        submodelElementOf: compositionSubmodel1
    });
    //No entiendo que hace esto
    measurementCollection.addElements([nmax, rotationSpeed, rotationSpeedRange, maxSpeedRelationship]);
    capabilityCollection.addElements([rotationMeasureCapability]); */

/*     const conceptDictionary = server.coreaas.addConceptDictionary({
        browseName: "ConceptDict_1",
        idShort: "ConceptDictionary_1",
        conceptDictionaryOf: aas_1,
        description: [new _1.LocalizedText({ locale: "en", text: "Dicitonary for the Festo Controller." }),
            new _1.LocalizedText({ locale: "it", text: "Dizionario per il Controller Festo" })]
    }).addConceptDescriptionRef([
        new Key({
            idType: _1.KeyType.IRI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "www.festo.com/dic/08111234"
        })
    ]).addConceptDescriptionRef([
        new Key({
            idType: _1.KeyType.IRDI,
            local: true,
            type: _1.KeyElements.ConceptDescription,
            value: "0173-1#02-BAA120#007"
        })
    ]);
    
    const embedded_1 = server.coreaas.addEmbeddedDataSpecification({
        browseName: "EmbeddedDS_1",
        hasDataSpecification: [new Key({
                idType: _1.KeyType.IRI,
                local: false,
                type: _1.KeyElements.GlobalReference,
                value: "www.admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360"
            })],
    }).addDataSpecificationIEC61360({
        identifier: "rtzspd#123",
        preferredName: "Rotation Speed",
        definition: "The Rotation Speed of something",
        dataType: CoreAAS_enums_1.DataTypeIEC61360Type.REAL_MEASURE,
        unit: "1/m",
        unitId: [new Key({
                idType: _1.KeyType.IRDI,
                local: false,
                type: _1.KeyElements.GlobalReference,
                value: "0173-1#05-AAA650#002"
            })],
        shortName: "N",
        valueFormat: "NR1..5"
    });
    
    server.coreaas.addConceptDescription({
        browseName: "N",
        identification: new Identifier({
            id: "www.festo.com/dic/08111234",
            idType: _1.IdentifierType.IRI
        }),
        conceptDescriptionOf: conceptDictionary
    })
        .hasEmbeddedDataSpecifications(embedded_1)
        .semanticOf(rotationSpeed);
    
    const embedded_2 = server.coreaas.addEmbeddedDataSpecification({
        browseName: "EmbeddedDS_1",
        hasDataSpecification: [new Key({
                idType: _1.KeyType.IRI,
                local: false,
                type: _1.KeyElements.GlobalReference,
                value: "www.admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360"
            })],
    }).addDataSpecificationIEC61360(server.coreaas.addDataSpecificationIEC61360({
        preferredName: "Max Rotation Speed",
        shortName: "NMAX",
        valueFormat: "NR1..5",
        unitId: [new Key({
                idType: _1.KeyType.IRDI,
                local: false,
                type: _1.KeyElements.GlobalReference,
                value: "0173-1#05-AAA650#002"
            })]
    }));
    server.coreaas.addConceptDescription({
        browseName: "NMax",
        identification: new Identifier({
            id: "0173-1#02-BAA120#007",
            idType: _1.IdentifierType.IRDI
        }),
        hasEmbeddedDataSpecifications: embedded_2,
        conceptDescriptionOf: conceptDictionary
    })
        .semanticOf(nmax); */
        

    server.start(function () {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl);
    });
}
server.initialize(post_initialize);