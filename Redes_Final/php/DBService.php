<?php



function set($table, $formData, $scope=null, $ignore_duplicate=null)
{
  include "ligabd.php";

  //echo var_dump($formData);
  


  if (isset($scope)) {
    $scope = "WHERE ".$scope;
  }else{
    $scope = "";
  }


  $KeysString = "";
  $ValuesString = "";

  foreach ($formData as $key => $value) {

    $KeysString = $KeysString . "`". $key . "`,";
    
    if (is_string($value)) {
      $value = "'" . $value . "'";
    }

    $ValuesString = $ValuesString . $value . ",";
  }

  $KeysString = rtrim($KeysString, ",");
  $ValuesString = rtrim($ValuesString, ",");

  $entries = [];
  foreach ($formData as $key => $value) {
    $entries[] = "`$key` = " . (is_string($value) ? "'" . $value . "'" : $value);
  } 
  $updatestring = implode(", ", $entries);

  $insert_function = "INSERT INTO " . $table . "(" . $KeysString . ") " . "VALUES (" . $ValuesString . ")";

  if (!$ignore_duplicate){
    $insert_function = $insert_function."
  ON DUPLICATE KEY UPDATE 
  ".$updatestring;
  }
  $sql_function = $insert_function;
  

  try {
    $resultado = mysqli_query($con,$sql_function);
    return $resultado;
  }catch (\Throwable $erro){
    return $erro."\n".$sql_function;
  }
}

function get($table, $scope=null)
{
  include "ligabd.php";







  if (isset($scope)) {
    $scope = " WHERE " . $scope;
  }else{
    $scope = "";
  }


  $sql_function = "SELECT * FROM " . $table . $scope;
  
  try {
    $resultado = mysqli_query($con,$sql_function);
   
    return $resultado;
  }catch (\Throwable $erro){
    echo $erro;
    return null;
  }
 
}
?>