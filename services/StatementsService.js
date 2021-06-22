module.exports = class StatementsService {
    constructor() {
        this.statements = {
            $update: [],
            $add: [],
            $remove: []
        };
        this.errors = [];
    }

    async handle(originalDocument, mutations) {
        try {
            const mutationsKeys = Object.keys(mutations);
            for (let i = 0; i < mutationsKeys.length; i++) {
                const mutationKey = mutationsKeys[i];

                if (mutationKey in originalDocument) {
                    mutations[mutationKey].forEach(mutation => {
                        this.generateStatement(originalDocument[mutationKey], mutationKey, mutation);
                    });
                } else {
                    this.addError({
                        message: `Property ${mutationKey} not found in document.`,
                        document: originalDocument
                    });
                }
            }

            if (this.hasErrors())
                this.showErrors();

            this.prepareStatements();

            return this.statements;
        } catch (error) {
            return { error: error.message };
        }
    }

    addStatement(type, statement) {
        this.statements[type].push(statement);
    }

    addError(error) {
        this.errors.push(error);
    }

    hasErrors() {
        return this.errors.length > 0;
    }

    showErrors() {
        console.log(this.errors);
    }

    generateStatement(subdocument, documentKey, mutation, parentDocumentKey = null, parentIndex = null) {
        try {
            if ("_id" in mutation) {
                const removeStatement = ("_delete" in mutation)
                    ? (mutation._delete)
                    : false;
                if (removeStatement) {
                    this.generateRemoveStatement(subdocument, documentKey, mutation, parentDocumentKey, parentIndex);
                } else {
                    this.generateUpdateStatement(subdocument, documentKey, mutation, parentDocumentKey, parentIndex);
                }
            } else {
                this.generateAddStatement(documentKey, mutation, parentDocumentKey, parentIndex);
            };
        } catch (error) {
            throw error;
        };
    };

    generateAddStatement(documentKey, mutation, parentDocumentKey, parentIndex) {
        try {
            const statement = (parentDocumentKey && parentIndex)
                ? {
                    [`${parentDocumentKey}.${parentIndex}.${documentKey}`]: [mutation]
                }
                : {
                    [documentKey]: [mutation]
                };
            this.addStatement("$add", statement);
        } catch (error) {
            throw error;
        }
    }

    generateUpdateStatement(subdocument, documentKey, mutation, parentDocumentKey, parentIndex) {
        try {
            const { _id, ...otherProps } = mutation;
            const index = subdocument.findIndex(item => item._id == _id);
            if (index < 0)
                throw new Error(`[Update] Register not found: documentkey ${documentKey}, _id: ${_id}`);

            Object.keys(otherProps).map(key => {
                if (Array.isArray(mutation[key])) {
                    mutation[key].forEach(propMutation => {
                        this.generateStatement(subdocument[index][key], key, propMutation, documentKey, index);
                    });
                } else {
                    const statement = (parentDocumentKey && parentIndex)
                        ? {
                            [`${parentDocumentKey}.${parentIndex}.${documentKey}.${index}.${key}`]: mutation[key]
                        }
                        : {
                            [`${documentKey}.${index}.${key}`]: mutation[key]
                        };
                    this.addStatement("$update", statement);
                };
            });
        } catch (error) {
            throw error;
        }
    }

    generateRemoveStatement(subdocument, documentKey, mutation, parentDocumentKey, parentIndex) {
        try {
            const { _id } = mutation;
            const index = subdocument.findIndex(item => item._id == _id);
            if (index < 0)
                throw new Error(`[Remove] Register not found: documentkey ${documentKey}, _id: ${_id}`);

            const statement = (parentDocumentKey && parentIndex)
                ? {
                    [`${parentDocumentKey}.${parentIndex}.${documentKey}.${index}`]: true
                }
                : {
                    [`${documentKey}.${index}`]: true
                };
            this.addStatement("$remove", statement);
        } catch (error) {
            throw error;
        }
    }

    prepareStatements() {
        Object.keys(this.statements).forEach(key => {
            if (this.statements[key].length == 0) {
                delete this.statements[key];
            } else if (this.statements[key].length == 1)
                this.statements[key] = this.statements[key][0];
        });
    }
}