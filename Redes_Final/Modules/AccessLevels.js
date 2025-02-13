AccessLevels = [
    "admin" = 3,
    "employee" = 2,
    "" = 0,
]

function HasPermission(AccessLevel, RequiredLevel){
    AccessLevel = typeof(AccessLevel) == "string" && AccessLevels[AccessLevel] || AccessLevel
    return AccessLevel >= RequiredLevel
}